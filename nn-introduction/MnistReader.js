const fs = require("fs");

const BATCH_SIZE = 5000;
const MAX_BATCHES = 10;
const PIXEL_KEEP_THRESHOLD = 20;
function readIdxFile(filePath) {
  const data = fs.readFileSync(filePath);

  let offset = 0;
  const magicNumber = data.readUInt32BE(offset);
  offset += 4;
  const numberOfItems = data.readUInt32BE(offset);
  offset += 4;
  //Label file
  if (magicNumber === 2049) {
    const labels = [];

    for (let i = 0; i < numberOfItems; i++) {
      labels.push(data.readUint8(offset));
      offset += 1;
    }
    return { type: "labels", data: labels };
  } else {
    //image file
    const rows = data.readUInt32BE(offset);
    offset += 4;
    const cols = data.readUInt32BE(offset);
    offset += 4;

    const images = [];

    for (let i = 0; i < numberOfItems; i++) {
      const image = [];
      for (let r = 0; r < rows; r++) {
        const row = [];

        for (let c = 0; c < cols; c++) {
          row.push(data.readUint8(offset));
          offset += 1;
        }
        image.push(row);
      }
      images.push(image);
    }
    return { type: "images", data: images };
  }
}

function saveBatch(batch, labels, inputs, path) {
  const data = {
    labels,
    inputs,
  };

  try {
    fs.writeFileSync(`${path}-${batch}.json`, JSON.stringify(data, null, 0));
    console.log(`File ${path}-${batch}.json saved!`);
  } catch (e) {
    console.log(e.message);
  }
}

function saveData(labels, inputs, path) {
  let batchTracker = 0;

  for (let i = 0; i < labels.length; i += BATCH_SIZE) {
    const labelsBatch = labels.slice(i, i + BATCH_SIZE);
    const inputsBatch = inputs.slice(i, i + BATCH_SIZE);

    saveBatch(i / BATCH_SIZE, labelsBatch, inputsBatch, path);

    batchTracker++;
    if (batchTracker === MAX_BATCHES) {
      break;
    }
  }
}

function saveTestingData() {
  const testImages = readIdxFile("./datasets/mnist/t10k-images.idx3-ubyte");

  const testLabels = readIdxFile("./datasets/mnist/t10k-labels.idx1-ubyte");

  const processedImages = testImages.data.map((image) =>
    image.map((row) =>
      row.map((pixel) => (pixel > PIXEL_KEEP_THRESHOLD ? pixel : 0))
    )
  );

  const binaryLabels = testLabels.data.map((label) => (label === 0 ? 1 : 0));
  const flatImages = processedImages.map((image) => image.flat());

  saveData(binaryLabels, flatImages, "./datasets/mnist/test-data");
  saveData(binaryLabels, processedImages, "./frontend/public/mnist/test-data");
}

function saveTrainingData() {
  const trainingImages = readIdxFile(
    "./datasets/mnist/train-images.idx3-ubyte"
  );

  const trainingLabels = readIdxFile(
    "./datasets/mnist/train-labels.idx1-ubyte"
  );

  const binaryLabels = trainingLabels.data.map((label) =>
    label === 0 ? 1 : 0
  );
  const flatImages = trainingImages.data.map((image) =>
    image.flat().map((pixel) => (pixel > PIXEL_KEEP_THRESHOLD ? pixel : 0))
  );

  saveData(binaryLabels, flatImages, "./datasets/mnist/train-data");
}

saveTestingData();
saveTrainingData();

console.log("Parsing End!");
