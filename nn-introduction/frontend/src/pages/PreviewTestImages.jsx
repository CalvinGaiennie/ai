import { useEffect } from "react";

import { useState } from "react";

function PreviewTestImages() {
  const [mnistData, setMnistData] = useState(null);

  useEffect(() => {
    fetch("/mnist/test-data-0.json")
      .then((responce) => responce.json())
      .then((data) => setMnistData(data));
  }, []);

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
        <div className="images">
          {inputs.map((input, index) => (
            <div key={index} className="image-container">
              <img src={createImageURL(input)} alt={`Digit ${labels[index]}`} />
              <p>
                label: {labels[index]} index: {index}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PreviewTestImages;
