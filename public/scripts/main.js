(async function () {
  const data = new MnistData();
  await data.load();
  
  $(() => $("#preload-view").hide());
  

  const utils = {};
  utils.data = data;

  utils.createModel = function (layers) {
    const model = tf.sequential();
    model.add(tf.layers.reshape({
      inputShape: [28, 28, 1],
      targetShape: [28, 28, 1]
    }));

    layers.forEach((layer, index) => {
      const activation = (index == layers.length - 1) ? "softmax" : "relu";
      switch (layer.type) {
        case "fc":
          model.add(tf.layers.dense({
            units: layer.dims.valueOf(),
            kernelInitializer: 'varianceScaling',
            activation: activation
          }));

          break;
        case "cnn":
          model.add(tf.layers.conv2d({
            kernelSize: layer.kernelSize.valueOf(),
            filters: layer.features.valueOf(),
            strides: layer.strides.valueOf(),
            kernelInitializer: 'varianceScaling',
            activation: activation
          }));
          break;
        case "ops":
          switch(layer.operation){
            case "flatten":
              model.add(tf.layers.flatten());
              break;
          }
          break;
      }
    });

    const LEARNING_RATE = 3e-4;
    const optimizer = tf.train.adam(LEARNING_RATE);
    model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  utils.train = async function (model, appendLoss=false) {
    const BATCH_SIZE = 64;
    const TRAIN_BATCHES = 1;

    const TEST_BATCH_SIZE = 1024;

    const lossValues = [];
    const accuracyValues = [];

    for (let i = 0; i < TRAIN_BATCHES; i++) {
      const batch = data.nextTrainBatch(BATCH_SIZE);
      const testBatch = data.nextTestBatch(TEST_BATCH_SIZE);
      const validationData = [
        testBatch.xs.reshape([TEST_BATCH_SIZE, 28, 28, 1]), testBatch.labels
      ];

      // The entire dataset doesn't fit into memory so we call fit repeatedly
      // with batches.
      const reshaped = tf.tidy(() => batch.xs.reshape([BATCH_SIZE, 28, 28, 1]));
      const history = await model.fit(
        reshaped, batch.labels, {
          batchSize: BATCH_SIZE,
          validationData,
          epochs: 1
        });

      const loss = history.history.loss[0];
      const accuracy = history.history.acc[0];

      if (appendLoss) window.disp.addLossAccur(loss, accuracy);


      reshaped.dispose();
      batch.xs.dispose();
      batch.labels.dispose();

      validationData[0].dispose();
      testBatch.xs.dispose();
      testBatch.labels.dispose();
    }
  }

  utils.predict = function (model, batch) {

    tf.tidy(() => {
      if(batch === undefined){
        batch = data.nextTestBatch(1).xs;
      }
      const output = model.predict(batch.reshape([-1, 28, 28, 1]));
      window.disp.renderImage(batch.slice([0, 0], [1, 28 ** 2]));

      window.disp.renderProbs(output.dataSync());
      
      batch.dispose();
    });
  }

  window.ml = utils;
})();
