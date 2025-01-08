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
  }

  reluActivation(weightedSum) {
    return Math.max(0, weightedSum);
  }

  // softmax(outputs) {
  //   return outputs.map((output, index) => {
  //     const nominator = Math.exp(output);
  //     const denominator = outputs.reduce((sum, val) => sum + Math.exp(val), 0);
  //     return nominator / denominator;
  //   });
  // }

  softmax(outputs) {
    const maxOutput = Math.max(...outputs);
    const expValues = outputs.map((output) => Math.exp(output - maxOutput));
    const sumExpValues = expValues.reduce((sum, val) => sum + val, 0);
    return expValues.map((val) => val / sumExpValues);
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
