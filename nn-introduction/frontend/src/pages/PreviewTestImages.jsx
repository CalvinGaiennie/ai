import { useEffect } from "react";

import { useState } from "react";

function PreviewTestImages() {
  const [mnistData, setMnistData] = useState(null);
  const [binaryModel, setBinaryModel] = useState(null);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    fetch("/mnist/test-data-0.json")
      .then((responce) => responce.json())
      .then((data) => setMnistData(data));
  }, []);

  useEffect(() => {
    fetch("/mnist/binary-model.json")
      .then((responce) => responce.json())
      .then((data) => setBinaryModel(data));
  }, []);

  function activationFunction(sum) {
    return sum >= 0 ? 1 : 0;
  }
  function predict(image) {
    let sum = binaryModel.bias;
    const inputs = image.flat();

    binaryModel.weights.forEach((weight, i) => {
      sum += weight * inputs[i];
    });
    const prediction = activationFunction(sum);

    return prediction;
  }

  function makeAllPredictions() {
    if (!binaryModel) {
      return;
    }
    const newPredictions = mnistData.inputs.map((image) => {
      return predict(image);
    });
    setPredictions(newPredictions);
  }

  function createImageURL(input) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 28;
    canvas.height = 28;

    const imageData = context.createImageData(28, 28);

    for (let i = 0; i < imageData.height; i++) {
      for (let j = 0; j < imageData.width; j++) {
        const pixelValue = input[i][j];
        const index = (i * imageData.width + j) * 4;
        imageData.data[index] = pixelValue;
        imageData.data[index + 1] = pixelValue;
        imageData.data[index + 2] = pixelValue;
        imageData.data[index + 3] = 255;
      }
    }
    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  }

  if (!mnistData) {
    return <p>Loading...</p>;
  }

  const { inputs, labels } = mnistData;
  return (
    <div>
      <h1>Mnist Test Images</h1>
      <div className="page-content">
        <div style={{ marginBottom: 20 }}>
          <button onClick={makeAllPredictions}>Make Predictions</button>
        </div>
        <div className="images">
          {inputs.map((input, index) => {
            const prediction = predictions ? predictions[index] : null;
            const isCorrect =
              prediction !== null && labels[index] === prediction;
            const borderColor =
              prediction === null ? "transparent" : isCorrect ? "green" : "red";

            return (
              <div
                key={index}
                className="image-container"
                style={{ border: `2px solid ${borderColor}`, margin: "5px" }}
              >
                <img
                  src={createImageURL(input)}
                  alt={`Digit ${labels[index]}`}
                />
                <p>
                  label: {labels[index]} index: {index}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PreviewTestImages;
