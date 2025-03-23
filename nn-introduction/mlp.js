class MLP {
  constructor() {
    (this.weightsInputsHidden = [
      [0.5, 0.5, 0.5, 0.5],
      //Weights for hidden neuron 1
      [-0.5, -0.5, -0.5, -0.5],
      //Weights for hidden neuron 2...
    ]),
      (this.biasesHidden = [0.1, -0.1]),
      (this.weightsHiddenOutput = [
        [1, -1], //weights for output neuron 1
        [-1, 1], //weights for output neuron 2
      ]);
    this.biasesOutput = [0.1, 0.1];

    this.outputSum = [];
    this.outputProbabilities = [];
    this.hiddenSums = [];
  }

  reluActivation(weightedSum) {
    return Math.max(0, weightedSum);
  }

  reluDerivate(z) {
    return z > 0 ? 1 : 0;
  }

  softmax(outputs) {
    const maxOutput = Math.max(...outputs);
    const expValues = outputs.map((output) => Math.exp(output - maxOutput));
    const sumExpValues = expValues.reduce((sum, val) => sum + val, 0);
    return expValues.map((val) => val / sumExpValues);
  }

  forward(inputs) {
    this.hiddenSums = this.weightsInputsHidden.map((weights, i) => {
      return weights.reduce(
        (sum, weight, j) => sum + weight * inputs[j],
        this.biasesHidden[i]
      );
    });
    console.log("hidden sums" + this.hiddenSums);

    const hiddenActivations = this.hiddenSums.map((weightedSum) =>
      this.reluActivation(weightedSum)
    );

    this.outputSums = this.weightsHiddenOutput.map((weights, i) => {
      return weights.reduce(
        (sum, weight, j) => sum + weight * hiddenActivations[j],
        this.biasesOutput[i]
      );
    });

    this.outputProbabilities = this.softmax(this.outputSums);
  }

  backward(targets) {
    const outputDeltas = this.outputProbabilities.map(
      (probability, i) => probability - targets[i]
    );
    console.log("output deltas", outputDeltas);

    const hiddenDeltas = this.hiddenSums.map((z, i) => {
      const error = outputDeltas.reduce(
        (sum, delta, j) => sum + delta * this.weightsHiddenOutput[j][i],
        0
      );
      return error * this.reluDerivate(z);
    });

    console.log("Hidden deltas:", hiddenDeltas);
  }

  train(inputs, targets) {
    this.forward(inputs);
    this.backward(targets);
  }
}

const mlp = new MLP();
const image = [0.1, 0.2, 0.3, 0.4];
const targets = [1, 0];

mlp.train(image, targets);
console.log(mlp.outputSums, mlp.outputProbabilities);
