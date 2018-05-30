(async function () {
  const data = new MnistData();
  await data.load();


  const model = tf.sequential();

  model.add(tf.layers.conv2d({
    inputShape: [28, 28, 1],
    kernelSize: 5,
    filters: 8,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }));
  model.add(tf.layers.maxPooling2d({
    poolSize: [2, 2],
    strides: [2, 2]
  }));
  model.add(tf.layers.conv2d({
    kernelSize: 5,
    filters: 16,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }));
  model.add(tf.layers.maxPooling2d({
    poolSize: [2, 2],
    strides: [2, 2]
  }));
  model.add(tf.layers.flatten());
  model.add(tf.layers.dense({
    units: 10,
    kernelInitializer: 'varianceScaling',
    activation: 'softmax'
  }));

  const LEARNING_RATE = 0.15;
  const optimizer = tf.train.sgd(LEARNING_RATE);
  model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });


  const BATCH_SIZE = 64;
  const TRAIN_BATCHES = 150;

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
      batch.xs.print();
      console.log(accuracyValues);
    }

    batch.xs.dispose();
    batch.labels.dispose();
    if (testBatch != null) {
      testBatch.xs.dispose();
      testBatch.labels.dispose();
    }

    tf.nextFrame();
  }
})();
