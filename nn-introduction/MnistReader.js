const fs = require("fs");

function readIdxFile(filePath) {
  const data = fs.readFileSync(filePath);

  let offset = 0;
  const magicNumber = data.readUInt32BE(offset);
  offset += 4;
  const numberOfItems = data.readUInt32BE(offset);
  offset += 4;
  //Label file
  if (magicNumber === 2049) {
  } else {
    //image file
    const rows = data.readUInt32BE(offset);
    offset += 4;
    const cols = data.readUInt32BE(offset);
    offset += 4;
  }

  console.log(magicNumber);
  console.log(numberOfItems, rows, cols);
}

readIdxFile("./datasets/mnist/train-images.idx3-ubyte");

readIdxFile("./datasets/mnist/t10k-labels.idx1-ubyte");
