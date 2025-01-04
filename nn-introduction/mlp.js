class MLP {
    constructor() {
        this.weightsInputsHidden = {
            [.5,.5,.5,.5], //Weights for hidden neuron 1
            [-.5,-.5,-.5,-.5], //Weights for hidden neuron 2
        },
        this.biasesHidden = [.1, -.1],

        this.weightsHiddenOutput = [
            [1,-1], //weights for output neuron 1
            [-1,1] //weights for output neuron 2
        ]
        this. biasesOutput = [.1,.1]
    }
}

const mlp = new MLP()
const input = [ .1,.2,.3,.4]