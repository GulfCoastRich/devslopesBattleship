const RS = require("readline-sync");

const type = "type";
const display = "display";
const sizes = ["4x4", "5x5", "6x6"];
let size = 0;
let board = [];

function getSize() {
  let choice = RS.keyInSelect(sizes, "Choose a board size)") + 1;
  if (choice === 1) {
    size = 4;
  } else if (choice === 2) {
    size = 5;
  } else if (choice === 3) {
    size = 6;
  } else if (choice === 0) {
    console.clear();
    startGame();
  }
  return size;
}

function startGame() {
  board = [];
  console.clear();
  console.log("Welcome to Battleship 🚢");

  size = getSize();
  createBoard(size);
  addShipsToBoard(size);
  console.log("The board is ready for play!");
  printBoard(size, false);
  guess(size);
}

function createBoard(size) {
  for (let i = 0; i < size; i++) {
    let arr = [];
    for (let j = 0; j < size; j++) {
      let alphaArr = ["A", "B", "C", "D", "E", "F"];
      arr.push({
        id: `${alphaArr[i]}${j}`,
        type: "-",
        hit: false,
        display: "-",
      });
    }
    board.push(arr);
  }
}

function addShipsToBoard(size) {
  let smallShips = 0;
  let largeShips = 0;

  if (size === 4) {
    smallShips = 1;
    largeShips = 1;
    totalShips = 2;
  } else if (size === 5) {
    smallShips = 2;
    largeShips = 1;
    totalShips = 3;
  } else if (size === 6) {
    smallShips = 2;
    largeShips = 2;
    totalShips = 4;
  }

  let choice = chooseOrientation();

  while (smallShips > 0) {
    placeShip(board, "small", choice);
    smallShips--;
  }

  while (largeShips > 0) {
    placeShip(board, "large", choice);
    largeShips--;
  }
}

function chooseOrientation() {
  return Math.floor(Math.random() * 2) + 1;
}

function placeShip(board, shipType, chooseOrientation) {
  let itemWidth = 0;
  let itemHeight = 0;
  const rows = board.length;
  const cols = board[0].length;
  let symbol = "";

  if (shipType === "small") {
    symbol += "🟠";
  } else {
    symbol += "🔵";
  }

  //determine the direction and size of the ship placement
  if (chooseOrientation === 1) {
    if (shipType == "small") {
      itemWidth = 1;
      itemHeight = 2;
    }
    if (shipType == "large") {
      itemWidth = 1;
      itemHeight = 3;
    }
  }
  if (chooseOrientation === 2) {
    if (shipType == "small") {
      itemWidth = 2;
      itemHeight = 1;
    }
    if (shipType == "large") {
      itemWidth = 3;
      itemHeight = 1;
    }
  }

  while (true) {
    // Generate random coordinates within the grid
    const x = Math.floor(Math.random() * (cols - itemWidth));
    const y = Math.floor(Math.random() * (rows - itemHeight));

    // Check for overlap
    let overlap = false;
    for (let i = y; i < y + itemHeight; i++) {
      for (let j = x; j < x + itemWidth; j++) {
        if (board[i][j].type !== "-") {
          overlap = true;
          break;
        }
      }
      if (overlap) break;
    }

    // If no overlap, place the item
    if (!overlap) {
      for (let i = y; i < y + itemHeight; i++) {
        for (let j = x; j < x + itemWidth; j++) {
          board[i][j].type = symbol;
        }
      }
      return board;
    }
  }
}

//Will return board object values based on key
function getValues(board, key) {
  let values = [];
  for (let i = 0; i < board.length; i++) {
    let val = [];
    for (let j = 0; j < board[i].length; j++) {
      val.push(board[i][j][key]);
    }
    values.push(val);
  }
  return values;
}

function printBoard(size, debug) {
  let keyArgument = debug ? type : display;
  let values = getValues(board, keyArgument);
  console.log("Key arg = " + keyArgument);
  if (size === 4) {
    console.table({
      A: values[0],
      B: values[1],
      C: values[2],
      D: values[3],
    });
  } else if (size === 5) {
    console.table({
      A: values[0],
      B: values[1],
      C: values[2],
      D: values[3],
      E: values[4],
    });
  } else if (size === 6) {
    console.table({
      A: values[0],
      B: values[1],
      C: values[2],
      D: values[3],
      E: values[4],
      F: values[5],
    });
  }
}

function guess(size) {
  let guessCoordinate = RS.question("Please guess a coordinate: ");
  let isValid = false;
  const regex4 = /[A-D)][0-3]/i;
  const regex5 = /[A-E][0-4]/i;
  const regex6 = /[A-F][0-5]/i;

  if (size === 4) {
    isValid = regex4.test(guessCoordinate);
  } else if (size === 5) {
    isValid = regex5.test(guessCoordinate);
  } else if (size === 6) {
    isValid = regex6.test(guessCoordinate);
  }

  let guessUpper = guessCoordinate.replace(
    /([a-zA-Z])(\d)/g,
    function (match, letter, number) {
      return letter.toUpperCase() + number;
    }
  );

  
  if (!isValid) {
    console.log("That is not a valid guess. Please try again");
    guess(size);
  }

  for (const el of board) {
    for (const obj of el) {
      if ((guessUpper === obj.id && obj.hit) === true) {
        console.log(
          "You have already guessed that coordinate."
        );
        guess(size);
      }
      if (guessUpper === obj.id) {
        if (obj.type === "🟠") {
          obj.display = "🟠";
        } else if (obj.type === "🔵") {
          obj.display = "🔵";
        } else if (obj.type === "-") {
          obj.display = "❌";
        }
        obj.hit = true;
      }
    }
  }

  if (isGameOver(board)) {
    console.clear();
    endGame();
  }
  console.clear();
  printBoard(size, false);
  guess(size);
}

function isGameOver(board) {
  const arr = [];
  for (const el of board) {
    for (const obj of el) {
      if (obj.type === "🟠" || obj.type === "🔵") {
        arr.push(obj);
      }
    }
  }

  if (arr.some((obj) => obj.hit === false)) {
    return false;
  } else {
    return true;
  }
}

function endGame() {
  if (board) {
    console.log(`=============================================
__   _______ _   _   _    _ _____ _   _
\\ \\ / /  _  | | | | | |  | |_   _| \\ | |
 \\ V /| | | | | | | | |  | | | | |  \\| |
  \\ / | | | | | | | | |/\\| | | | | . ' |
  | | \\ \\_/ / |_| | \\  /\\  /_| |_| |\\  |
  \\_/  \\___/ \\___/   \\/  \\/ \\___/\\_| \\_/
  
=============================================`);
  }
  const playAgain = RS.keyInYN("Would you like to play again?");
  if (playAgain) {
    startGame();
  } else {
    console.clear();
  }
}

module.exports = {
  startGame,
};


