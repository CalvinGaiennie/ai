const seedRandom = require("seedrandom");
const seed = "perc-1";
const fs = require("fs");
const tf = require("@tensorflow/tfjs-node");

seedRandom(seed, { global: true });

function normalizeData(data) {
  return data.map((input) => input.map((pixel) => pixel / 255));
}

function oneHotEncode(label) {
  return Array.from({ length: 10 }, (_, i) => (i == label ? 1 : 0));
}

function shuffleArrays(array1, array2) {
  for (let i = array1.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array1[i], array1[j]] = [array1[j], array1[i]];
    [array2[i], array2[j]] = [array2[j], array2[i]];
  }
}

function loadData(trainBatches, testBatches) {
  const trainInputs = [];
  const trainLabels = [];

  const testInputs = [];
  const testLabels = [];

  for (let i = 0; i < trainBatches; i++) {
    const { inputs, labels } = JSON.parse(
      fs.readFileSync(`./datasets/mnist/train-data-${i}.json`, "utf8")
    );
    trainInputs.push(...normalizeData(inputs));
    trainLabels.push(...labels);
  }

  for (let i = 0; i < testBatches; i++) {
    const { inputs, labels } = JSON.parse(
      fs.readFileSync(`./datasets/mnist/test-data-${i}.json`, "utf8")
    );
    testInputs.push(...normalizeData(inputs));
    testLabels.push(...labels);
  }

  const { inputs, labels } = JSON.parse(
    fs.readFileSync(`./datasets/mnist/misclassified-data-mlp.json`, "utf8")
  );

  trainInputs.push(
    ...normalizeData(
      inputs.map((image) => image.map((pixel) => (pixel > 20 ? pixel : 0)))
    )
  );
  trainLabels.push(...labels);

  shuffleArrays(trainInputs, trainLabels);

  return {
    trainInputs,
    trainLabels: trainLabels.map((label) => oneHotEncode(label)),
    testInputs,
    testLabels: testLabels.map((label) => oneHotEncode(label)),
  };
}

function createModel(inputSize, hiddenSize, outputSize, learningRate) {
  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      inputShape: [inputSize],
      units: hiddenSize,
      activation: "relu",
    })
  );
  model.add(
    tf.layers.dense({
      units: outputSize,
      activation: "softmax",
    })
  );
  model.compile({
    optimizer: tf.train.adam(learningRate),
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}

const { trainInputs, trainLabels, testInputs, testLabels } = loadData(8, 2);

const trainInputsTensor = tf.tensor2d(trainInputs);
const trainLabelsTensor = tf.tensor2d(trainLabels);
const testInputsTensor = tf.tensor2d(testInputs);
const testLabelsTensor = tf.tensor2d(testLabels);

const inputSize = trainInputs[0].length;
const hiddenSize = 64;
const outputSize = 10;
const learningRate = 0.008;

createModel(inputSize, hiddenSize, outputSize, learningRate);

const model = createModel(inputSize, hiddenSize, outputSize, learningRate);
console.log(model);
