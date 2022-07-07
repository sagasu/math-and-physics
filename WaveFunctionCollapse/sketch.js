
const path = 'img';
const tileImages = [];

let imgs = [];
let range = (start=0, end=null, step=1) => new Array(end - start).fill().map((d, i) => i + start);
  
let grid = [];
const gridSize = 25;

function preload() {
  range(0,13).map(i => tileImages[i] = loadImage(`${path}/${i}.png`));
}

function removeDuplicatedTiles(tiles) {
  const uniqueTilesMap = {};
  for (const tile of tiles) {
    const key = tile.edges.join(',');
    uniqueTilesMap[key] = tile;
  }
  return Object.values(uniqueTilesMap);
}

function setup() {
  createCanvas(400, 400);

  imgs[0] = new Tile(tileImages[0], ['AAA', 'AAA', 'AAA', 'AAA']);
  imgs[1] = new Tile(tileImages[1], ['BBB', 'BBB', 'BBB', 'BBB']);
  imgs[2] = new Tile(tileImages[2], ['BBB', 'BCB', 'BBB', 'BBB']);
  imgs[3] = new Tile(tileImages[3], ['BBB', 'BDB', 'BBB', 'BDB']);
  imgs[4] = new Tile(tileImages[4], ['ABB', 'BCB', 'BBA', 'AAA']);
  imgs[5] = new Tile(tileImages[5], ['ABB', 'BBB', 'BBB', 'BBA']);
  imgs[6] = new Tile(tileImages[6], ['BBB', 'BCB', 'BBB', 'BCB']);
  imgs[7] = new Tile(tileImages[7], ['BDB', 'BCB', 'BDB', 'BCB']);
  imgs[8] = new Tile(tileImages[8], ['BDB', 'BBB', 'BCB', 'BBB']);
  imgs[9] = new Tile(tileImages[9], ['BCB', 'BCB', 'BBB', 'BCB']);
  imgs[10] = new Tile(tileImages[10], ['BCB', 'BCB', 'BCB', 'BCB']);
  imgs[11] = new Tile(tileImages[11], ['BCB', 'BCB', 'BBB', 'BBB']);
  imgs[12] = new Tile(tileImages[12], ['BBB', 'BCB', 'BBB', 'BCB']);

  range(0,12).map(i => imgs[i].index = i);
  
  const initialTileCount = imgs.length;
  range(0, initialTileCount).map((i, index) => {
    let tempTiles = [];
    for (let j = 0; j < 4; j++) {
      tempTiles.push(imgs[i].rotate(j));
    }
    tempTiles = removeDuplicatedTiles(tempTiles);
    imgs = imgs.concat(tempTiles);
  });
  
  imgs.map((tile) => tile.analyze(imgs));

  startOver();
}

var startOver = () => range(0, gridSize * gridSize).map(i => grid[i] = new Cell(imgs.length));

function isValid(arr, valid) {
  for (let i = arr.length - 1; i >= 0; i--) {
    let element = arr[i];
    if (!valid.includes(element)) arr.splice(i, 1);
    
  }
}

function mousePressed() {
  redraw();
}

function draw() {
  background(0);

  const w = width / gridSize;
  const h = height / gridSize;
  for (let j = 0; j < gridSize; j++) {
    for (let i = 0; i < gridSize; i++) {
      let cell = grid[i + j * gridSize];
      if (cell.collapsed) {
        let index = cell.options[0];
        image(imgs[index].img, i * w, j * h, w, h);
      } else {
        noFill();
        stroke(51);
        rect(i * w, j * h, w, h);
      }
    }
  }

  let gridCopy = grid.slice();
  gridCopy = gridCopy.filter((a) => !a.collapsed);

  if (gridCopy.length == 0) {
    return;
  }
  gridCopy.sort((a, b) => {
    return a.options.length - b.options.length;
  });

  let len = gridCopy[0].options.length;
  let stopIndex = 0;
  for (let i = 1; i < gridCopy.length; i++) {
    if (gridCopy[i].options.length > len) {
      stopIndex = i;
      break;
    }
  }

  if (stopIndex > 0) gridCopy.splice(stopIndex);
  const cell = random(gridCopy);
  cell.collapsed = true;
  const pick = random(cell.options);
  if (pick === undefined) {
    startOver();
    return;
  }
  cell.options = [pick];

  const nextGrid = [];
  for (let j = 0; j < gridSize; j++) {
    for (let i = 0; i < gridSize; i++) {
      let index = i + j * gridSize;
      if (grid[index].collapsed) {
        nextGrid[index] = grid[index];
      } else {
        let options = new Array(imgs.length).fill(0).map((x, i) => i);

        if (j > 0) {
          let up = grid[i + (j - 1) * gridSize];
          let validOptions = [];
          for (let option of up.options) {
            let valid = imgs[option].down;
            validOptions = validOptions.concat(valid);
          }
          isValid(options, validOptions);
        }

        if (i < gridSize - 1) {
          let right = grid[i + 1 + j * gridSize];
          let validOptions = [];
          for (let option of right.options) {
            let valid = imgs[option].left;
            validOptions = validOptions.concat(valid);
          }
          isValid(options, validOptions);
        }

        if (j < gridSize - 1) {
          let down = grid[i + (j + 1) * gridSize];
          let validOptions = [];
          for (let option of down.options) {
            let valid = imgs[option].up;
            validOptions = validOptions.concat(valid);
          }
          isValid(options, validOptions);
        }

        if (i > 0) {
          let left = grid[i - 1 + j * gridSize];
          let validOptions = [];
          for (let option of left.options) {
            let valid = imgs[option].right;
            validOptions = validOptions.concat(valid);
          }
          isValid(options, validOptions);
        }

        nextGrid[index] = new Cell(options);
      }
    }
  }

  grid = nextGrid;
}
