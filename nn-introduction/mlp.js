const seedRandom = require("seedrandom");
const seed = "perc-1";
const fs = require("fs");

seedRandom(seed, { global: true });

function randomize() {
  return Math.random() * 0.3 - 0.1;
}

function mseLoss(outputs, targets) {
  return (
    0.5 *
    outputs.reduce((sum, output, i) => sum + (output - targets[i]) ** 2, 0)
  );
}

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

class MLP {
  constructor(inputSize, hiddenSize, outputSize, learningRate = 0.01) {
    this.learningRate = learningRate;

    this.weightsInputHidden = Array.from({ length: hiddenSize }, () =>
      Array.from({ length: inputSize }, randomize)
    );

    this.biasesHidden = Array.from({ length: hiddenSize }, randomize);

    this.weightsHiddenOutput = Array.from({ length: outputSize }, () =>
      Array.from({ length: hiddenSize }, randomize)
    );

    this.biasesOutput = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];

    this.outputSum = [];
    this.outputProbabilities = [];
    this.hiddenSums = [];
    this.hiddenActivations = [];
  }

  reluActivation(weightedSum) {
    return Math.max(0, weightedSum);
  }

  reluDerivate(z) {
    return z > 0 ? 1 : 0;
  }

  softmax(outputs) {
    const maxOutput = Math.max(...outputs);
    const expValues = outputs.map((output) => {
      const expVal = Math.exp(output - maxOutput);
      return expVal;
    });

    const sumExpValues = expValues.reduce((sum, val) => sum + val, 0);

    return expValues.map((val) => val / sumExpValues);
  }

  forward(inputs) {
    this.hiddenSums = this.weightsInputHidden.map((weights, i) => {
      return weights.reduce(
        (sum, weight, j) => sum + weight * inputs[j],
        this.biasesHidden[i]
      );
    });
    this.hiddenActivations = this.hiddenSums.map((weightedSum) =>
      this.reluActivation(weightedSum)
    );

    this.outputSums = this.weightsHiddenOutput.map((weights, i) => {
      return weights.reduce(
        (sum, weight, j) => sum + weight * this.hiddenActivations[j],
        this.biasesOutput[i]
      );
    });

    this.outputProbabilities = this.softmax(this.outputSums);

    return this.outputProbabilities;
  }

  backward(inputs, targets) {
    const outputDeltas = this.outputProbabilities.map(
      (probability, i) => probability - targets[i]
    );

    const hiddenDeltas = this.hiddenSums.map((z, i) => {
      const error = outputDeltas.reduce(
        (sum, delta, j) => sum + delta * this.weightsHiddenOutput[j][i],
        0
      );
      return error * this.reluDerivate(z);
    });

    this.weightsHiddenOutput = this.weightsHiddenOutput.map((weights, i) => {
      return weights.map(
        (weight, j) =>
          weight -
          this.learningRate * outputDeltas[i] * this.hiddenActivations[j]
      );
    });
    this.biasesOutput = this.biasesOutput.map((bias, i) => {
      return bias - this.learningRate * outputDeltas[i];
    });

    this.weightsInputHidden = this.weightsInputHidden.map((weights, i) => {
      return weights.map(
        (weight, j) => weight - this.learningRate * hiddenDeltas[i] * inputs[j]
      );
    });

    this.biasesHidden = this.biasesHidden.map((bias, i) => {
      return bias - this.learningRate * hiddenDeltas[i];
    });
  }

  train(inputs, targets) {
    this.forward(inputs);
    this.backward(inputs, targets);
  }

  saveModel(path) {
    console.log("Preparing export");
    const exportData = {
      weightsInputHidden: this.weightsInputHidden,
      biasesHidden: this.biasesHidden,
      weightsHiddenOutput: this.weightsHiddenOutput,
      biasesOutput: this.biasesOutput,
    };
    const stringData = JSON.stringify(exportData, null, 2);

    try {
      fs.writeFileSync(path, stringData);
      console.log("File saved to: " + path);
    } catch (e) {
      console.log("Save failed: ", e.message);
    }
  }
}

//Model Training
const EPOCHS = 60;
const LEARNING_RATE = 0.008;
const TRAIN_BATCHES = 8;
const TEST_BATCHES = 2;

const trainInputs = [];
const trainLabels = [];

const testInputs = [];
const testLabels = [];

for (let i = 0; i < TRAIN_BATCHES; i++) {
  const { inputs, labels } = JSON.parse(
    fs.readFileSync(`./datasets/mnist/train-data-${i}.json`, "utf8")
  );
  trainInputs.push(...normalizeData(inputs));
  trainLabels.push(...labels);
}

for (let i = 0; i < TEST_BATCHES; i++) {
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

const trainLabelsEncoded = trainLabels.map((label) => oneHotEncode(label));
const testLabelsEncoded = testLabels.map((label) => oneHotEncode(label));

shuffleArrays(trainInputs, trainLabelsEncoded);

const inputSize = trainInputs[0].length;
const hiddenSize = 64;
const outputSize = 10;

const mlp = new MLP(inputSize, hiddenSize, outputSize, LEARNING_RATE);

for (let epoch = 0; epoch <= EPOCHS; epoch++) {
  let totalLoss = 0;
  for (let i = 0; i < trainInputs.length; i++) {
    mlp.train(trainInputs[i], trainLabelsEncoded[i]);

    totalLoss += mseLoss(mlp.outputProbabilities, trainLabelsEncoded[i]);
  }

  if (epoch % 2 == 0) {
    let correctPredictions = 0;

    for (let j = 0; j < testInputs.length; j++) {
      const targets = testLabelsEncoded[j];
      const outputProbabilites = mlp.forward(testInputs[j]);

      const predicted = outputProbabilites.indexOf(
        Math.max(...outputProbabilites)
      );

      const target = targets.indexOf(Math.max(...targets));

      if (predicted === target) {
        correctPredictions++;
      }
    }

    const accuracy = (correctPredictions / testInputs.length) * 100;

    console.log(
      `Epoch ${epoch}, Accuracy: ${accuracy}%, Loss: ${
        totalLoss / trainInputs.length
      }, Correct Predictions: ${correctPredictions}/${testInputs.length}`
    );
  }
}

mlp.saveModel("./frontend/public/mnist/mlp-mnist-model.json");
