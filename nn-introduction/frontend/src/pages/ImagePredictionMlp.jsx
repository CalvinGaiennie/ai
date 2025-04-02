import { useEffect, useRef, useState } from "react";

const WIDTH = 28;
const HEIGHT = 28;
const SCALE = 10;

function ImagePredictionMlp() {
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    fetch("/mnist/mlp-mnist-model.json")
      .then((responce) => responce.json())
      .then((data) => setModel(data));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.width = `${WIDTH * SCALE}px`;
    canvas.style.height = `${HEIGHT * SCALE}px`;

    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "white";
    context.lineWidth = 1.5;

    function startDrawing(event) {
      const { offsetX, offsetY } = event;

      const scaledX = offsetX / SCALE;
      const scaledY = offsetY / SCALE;

      context.beginPath();
      context.moveTo(scaledX, scaledY);
      isDrawingRef.current = true;
    }
    function draw(event) {
      if (!isDrawingRef.current) return;

      const { offsetX, offsetY } = event;

      const scaledX = offsetX / SCALE;
      const scaledY = offsetY / SCALE;
      context.lineTo(scaledX, scaledY);
      context.stroke();
    }
    function stopDrawing() {
      context.closePath();
      isDrawingRef.current = false;
    }

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);
    };
  }, []);

  function normalizeData(pixel) {
    const pix = pixel / 255;
    return pix;
  }
  function preprocessCanvas() {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const imageData = context.getImageData(0, 0, WIDTH, HEIGHT);
    const grayScaleData = [];

    for (let i = 0; i < imageData.data.length; i += 4) {
      grayScaleData.push(imageData.data[i]);
    }
    return grayScaleData;
  }

  function activationFunction(sum) {
    return Math.max(0, sum);
  }

  const softmax = (outputs) => {
    const maxOutput = Math.max(...outputs);
    const expValues = outputs.map((output) => Math.exp(output - maxOutput));
    const sumExpValues = expValues.reduce((sum, val) => sum + val, 0);
    return expValues.map((val) => val / sumExpValues);
  };
  function predict() {
    const inputs = preprocessCanvas().map((pixel) => normalizeData(pixel));

    const hiddenSums = model.weightsInputHidden.map((weights, i) => {
      return weights.reduce(
        (sum, weight, j) => sum + weight * inputs[j],
        model.biasesHidden[i]
      );
    });

    const hiddenActivations = hiddenSums.map((z) => activationFunction(z));

    const outputSums = model.weightsHiddenOutput.map((weights, i) => {
      return weights.reduce(
        (sum, weight, j) => sum + weight * hiddenActivations[j],
        model.biasesHidden[i]
      );
    });

    const outputProbabilities = softmax(outputSums);

    const prediction = outputProbabilities.indexOf(
      Math.max(...outputProbabilities)
    );

    setPrediction(prediction);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = "black";
    context.fillRect(0, 0, WIDTH, HEIGHT);
    setPrediction(null);
  }

  function saveToTrainingSet(label) {
    const input = preprocessCanvas();
    const misclassifiedData = { input, label };

    fetch("http://localhost:3001/save-misclassified", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(misclassifiedData),
    })
      .then((data) => {
        console.log(`data has been saved! data: ${data}`);
        clearCanvas();
      })
      .catch((error) => console.log("error saving data" + error));
  }
  return (
    <div>
      <h1>Image Prediction - Neural Network</h1>
      <div>
        <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
        <div>
          <button onClick={clearCanvas}>Clear </button>
          <button onClick={predict}>Prediction</button>
        </div>
        {prediction != null && <p>Prediction: {prediction}</p>}
        <div>
          {Array.from({ length: 10 }, (_, i) => i).map((label) => (
            <button key={`${label}`} onClick={() => saveToTrainingSet(0)}>
              Save: Label {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImagePredictionMlp;
