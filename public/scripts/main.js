(async function () {
  const data = new MnistData();
  data.load();

  const utils = {};
  utils.data = data;

  utils.createModel = function (layers) {
    const model = tf.sequential();
    model.add(tf.layers.flatten({
      inputShape: [28, 28, 1]
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
          break;
        case "ops":
          break;
      }
    });

    const LEARNING_RATE = 0.001;
    const optimizer = tf.train.adam(LEARNING_RATE);
    model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  utils.train = async function (model) {
    const BATCH_SIZE = 64;
    const TRAIN_BATCHES = 1;

    const TEST_BATCH_SIZE = 1000;
    const TEST_ITERATION_FREQUENCY = 5;

    const lossValues = [];
    const accuracyValues = [];

    for (let i = 0; i < TRAIN_BATCHES; i++) {
      const batch = data.nextTrainBatch(BATCH_SIZE);

      let testBatch;
      let validationData;
      // Every few batches test the accuracy of the mode.
      if (i % TEST_ITERATION_FREQUENCY === 0) {
        testBatch = data.nextTestBatch(TEST_BATCH_SIZE);
        validationData = [
        testBatch.xs.reshape([TEST_BATCH_SIZE, 28, 28, 1]), testBatch.labels
      ];
      }

      // The entire dataset doesn't fit into memory so we call fit repeatedly
      // with batches.
      const history = await model.fit(
        batch.xs.reshape([BATCH_SIZE, 28, 28, 1]), batch.labels, {
          batchSize: BATCH_SIZE,
          validationData,
          epochs: 1
        });

      const loss = history.history.loss[0];
      const accuracy = history.history.acc[0];

      // Plot loss / accuracy.
      lossValues.push({
        'batch': i,
        'loss': loss,
        'set': 'train'
      });

      if (testBatch != null) {
        accuracyValues.push({
          'batch': i,
          'accuracy': accuracy,
          'set': 'train'
        });
      }

      batch.xs.dispose();
      batch.labels.dispose();
      if (testBatch != null) {
        testBatch.xs.dispose();
        testBatch.labels.dispose();
      }

      tf.nextFrame();
    }
  }

  utils.predict = function (model) {
    const batch = data.nextTestBatch(1);

    tf.tidy(() => {
      const output = model.predict(batch.xs.reshape([-1, 28, 28, 1]));
      window.disp.renderImage(batch.xs.slice([0, 0], [1, 28 ** 2]));

      window.disp.renderProbs(output.dataSync());
    });
  }

  window.ml = utils;
})();
