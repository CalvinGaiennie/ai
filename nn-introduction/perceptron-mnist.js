const fs = require("fs");
const seedRandom = require("seedrandom");
const seed = "perc-1";

seedRandom(seed, { global: true });

class Perceptron {
  constructor(inputSize, learningRate = 0.01) {
    this.weights = Array(inputSize)
      .fill(0)
      .map(() => Math.random() * 0.3 - 0.1);
    this.bias = Math.random() * 0.3 - 0.1;
    this.learningRate = learningRate;
  }
  activationFunction(x) {
    return x >= 0 ? 1 : 0;
  }

  predict(inputs) {
    let sum = this.bias;

    for (let j = 0; j < inputs.length; j++) {
      sum += inputs[j] * this.weights[j];
    }

    return this.activationFunction(sum);
  }

  train(trainData, trainLabels) {
    for (let i = 0; i < trainData.length; i++) {
      let inputs = trainData[i];

      const yPredicted = this.predict(inputs);
      const yTrueValue = trainLabels[i];

      if (yTrueValue != yPredicted) {
        for (let k = 0; k < this.weights.length; k++) {
          this.weights[k] +=
            this.learningRate * (yTrueValue - yPredicted) * inputs[k];
        }
        this.bias += this.learningRate * (yTrueValue - yPredicted);
      }
    }
  }
  calculateAccuracy(inputs, labels) {
    let correct = 0;
    for (let i = 0; i < inputs.length; i++) {
      const yPredicted = this.predict(inputs[i]);

      if (yPredicted === labels[i]) {
        correct++;
      }
    }
    return (correct / inputs.length) * 100;
  }
}
const EPOCHS = 200;
const TRAIN_BATCHES = 10;
const TEST_BATCHES = 2;
const INPUT_SIZE = 28 * 28;

const trainInputs = [];
const trainLabels = [];

const testInputs = [];
const testLabels = [];

for (let i = 0; i < TRAIN_BATCHES; i++) {
  const { inputs, labels } = JSON.parse(
    fs.readFileSync(`./datasets/mnist/train-data-${i}.json`, "utf8")
  );
  trainInputs.push(...inputs);
  trainLabels.push(...labels);
}

for (let i = 0; i < TEST_BATCHES; i++) {
  const { inputs, labels } = JSON.parse(
    fs.readFileSync(`./datasets/mnist/test-data-${i}.json`, "utf8")
  );
  testInputs.push(...inputs);
  testLabels.push(...labels);
}

const perceptron = new Perceptron(INPUT_SIZE, 0.07);

for (let epoch = 0; epoch < EPOCHS; epoch++) {
  perceptron.train(trainInputs, trainLabels);

  const trainingAccuracy = perceptron.calculateAccuracy(
    trainInputs,
    trainLabels
  );
  const testingAccuracy = perceptron.calculateAccuracy(testInputs, testLabels);

  console.log(
    `Epoch ${epoch + 1}: Training Accuracy: ${trainingAccuracy.toFixed(2)}%, 
    Testing Accuracy: ${testingAccuracy.toFixed(2)}%
    `
  );
}