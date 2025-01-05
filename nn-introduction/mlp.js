class MLP {
  constructor() {
    (this.weightsInputsHidden = [
      [0.5, 0.5, 0.5, 0.5],
      //Weights for hidden neuron 1
      [-0.5, -0.5, -0.5, -0.5],
      //Weights for hidden neuron 2
    ]),
      (this.biasesHidden = [0.1, -0.1]),
      (this.weightsHiddenOutput = [
        [1, -1], //weights for output neuron 1
        [-1, 1], //weights for output neuron 2
      ]);
    this.biasesOutput = [0.1, 0.1];
  }

  reluActivation(weightedSum) {
    return Math.max(0, weightedSum);
  }

  softmax(outputs) {
    return outputs.map((output, index) => {});
  }
  forward(inputs) {
    const hiddenSums = this.weightsInputsHidden.map((weights, i) => {
      return weights.reduce(
        (sum, weight, j) => sum + weight * inputs[j],
        this.biasesHidden[i]
      );
    });

    const hiddenActivations = hiddenSums.map((weightedSum) =>
      this.reluActivation(weightedSum)
    );

    const outputSums = this.weightsHiddenOutput.map((weights, i) => {
      return weights.reduce(
        (sum, weight, j) => sum + weight * hiddenActivations[j],
        this.biasesOutput[i]
      );
    });

    console.log(outputSums);
  }
}

const mlp = new MLP();
const image = [0.1, 0.2, 0.3, 0.4];

const outputProbabilities = mlp.forward(image);

console.log(outputProbabilities);
