import { useEffect, useRef, useState } from "react";

const WIDTH = 28;
const HEIGHT = 28;
const SCALE = 10;

function ImagePrediction() {
  const [binaryModel, setBinaryModel] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetch("/mnist/binary-model.json")
      .then((responce) => responce.json())
      .then((data) => setBinaryModel(data));
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
    context.lineWidth = 2;

    function startDrawing() {
      console.log("startDrawing");
    }
    function draw() {
      console.log("draw");
    }
    function stopDrawing() {
      console.log("stopdrawing");
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
  return (
    <div>
      <h1>Image Prediction - Binary Perceptron</h1>
      <div>
        <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
        <div>
          <button>Clear </button>
          <button>Prediction</button>
        </div>
        <p>Prediction: is Zero</p>
      </div>
    </div>
  );
}

export default ImagePrediction;
