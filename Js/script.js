const SudokuGenerator = require("js-sudoku-generator").SudokuGenerator;

const numRemaining = board => [
  9 -
    board.filter(row => row.filter(element => element === 1).length === 1)
      .length,
  9 -
    board.filter(row => row.filter(element => element === 2).length === 1)
      .length,
  9 -
    board.filter(row => row.filter(element => element === 3).length === 1)
      .length,
  9 -
    board.filter(row => row.filter(element => element === 4).length === 1)
      .length,
  9 -
    board.filter(row => row.filter(element => element === 5).length === 1)
      .length,
  9 -
    board.filter(row => row.filter(element => element === 6).length === 1)
      .length,
  9 -
    board.filter(row => row.filter(element => element === 7).length === 1)
      .length,
  9 -
    board.filter(row => row.filter(element => element === 8).length === 1)
      .length,
  9 -
    board.filter(row => row.filter(element => element === 9).length === 1)
      .length
];

const boardSection = document.querySelector(".board");
const footer = document.querySelector("footer");
const timeElement = document.querySelector(".time");
const pauseResume = document.querySelector(".pause");
let timer, seconds = 0, paused = true;

// Check board complete
const checkComplete = () => {
  if(remainings.filter(num => num === 0).length === 9 &&
    validations.filter(cell => !cell.validity).length === 0)
    console.log("Completed")
};

// Upadat remainings
const updataRemainings = (index, value) => {
  if(index) footer.children[index - 1].firstElementChild.textContent = value
}

// Check if value of cell is true
const checkValid = e => {
  if (!e.key.match(/[1-9]/) && e.keyCode !== 8) e.preventDefault();
  else if (e.target.textContent.length === 1 || e.keyCode === 8) {
    updataRemainings(Number(e.target.textContent), ++remainings[e.target.textContent - 1])
    e.target.textContent = "";
  }
};

// Write on cell
const writeCell = e => {
  const spanIndex = Array.from(boardSection.children).indexOf(e.target);
  if (e.key.match(/[1-9]/) || e.keyCode === 8) {
    updataRemainings(
      Number(e.target.textContent),
      --remainings[e.target.textContent - 1]
    );
    const validity =
      Number(e.target.textContent) ===
      l_oFirstBoard.board[Math.floor(spanIndex / 9)][spanIndex % 9];
    !validity
      ? e.target.classList.add("not-valid")
      : e.target.classList.remove("not-valid");
    checkComplete();
  }
};

// Hover Neighbours of active cell
const hoverNeighbours = e => {
  const spanIndex = Array.from(boardSection.children).indexOf(e.target);
  const row = Math.floor(spanIndex / 9);
  const column = spanIndex % 9;
  Array.from(document.querySelectorAll(".hovered")).forEach(element =>
    element.classList.remove("hovered")
  );
  for (let i = row * 9; i < row * 9 + 9; i++)
    boardSection.children[i].classList.add("hovered");
  for (let i = column; i < 81; i += 9)
    boardSection.children[i].classList.add("hovered");
};

// Load game
const loadGame = () => {
  // Remove old data
  let child = boardSection.lastElementChild;
  while (child) {
    boardSection.removeChild(child);
    child = boardSection.lastElementChild;
  }
  
  // Get HTML Sudoku board
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const span = document.createElement("span");
      if (board[row][col]) {
        span.textContent = board[row][col];
      } else {
        span.contentEditable = true;
        span.classList.add("empty");
        span.addEventListener("keydown", checkValid);
        span.addEventListener("keyup", writeCell);
      }
      span.addEventListener("click", hoverNeighbours);
      if (row === 0 || row === 3 || row === 6) span.classList.add("top");
      if (row === 8) span.classList.add("bottom");
      boardSection.appendChild(span);
    }
  }

  // Get remainings
  Array.from(footer.children).forEach((button, i) => {
    // Remove old remainings
    const child = button.lastElementChild;
    child ? button.removeChild(child) : null;

    const remainNum = document.createElement("sup");
    remainNum.textContent = remainings[i];
    button.appendChild(remainNum)
  })

  // Start time
  if(!paused) clearInterval(timer);
  seconds = 0;
  timer = setInterval(() => {
    timeElement.textContent = `${Math.floor(seconds / 60)}:${seconds%60}`;
    seconds++;
  }, 1000);
  paused = false;
  pauseResume.textContent = "Pause";
  boardSection.classList.remove("disabled");
}

// Hover same numbers
Array.from(footer.children).forEach(button => button.addEventListener("click", () => {
  const num = button.textContent.slice(0, 1);
  for (let i = 0; i < 81; i++) {
    const child = boardSection.children[i];
    if (child.textContent === num) child.classList.add("hovered")
    else child.classList.remove("hovered");
  }
}))

SudokuGenerator.generate(1);
let l_oFirstBoard = SudokuGenerator.generatedBoards[0];
let board = l_oFirstBoard.getSheet(0);
let remainings = numRemaining(board);
loadGame();

// New game
const level = document.querySelector("select");
document.querySelector(".new-game").addEventListener("click", () => {
  SudokuGenerator.generate(1);
  l_oFirstBoard = SudokuGenerator.generatedBoards[0];
  board = l_oFirstBoard.getSheet(level.value);
  remainings = numRemaining(board);
  loadGame();
})

// Pause / Resume game
pauseResume.addEventListener("click", () => {
  if(!paused) {
    clearInterval(timer);
    pauseResume.textContent = "Resume";
  }else {
    timer = setInterval(() => {
      timeElement.textContent = `${Math.floor(seconds / 60)}:${seconds %
        60}`;
      seconds++;
    }, 1000);
    pauseResume.textContent = "Pause";
  }
  paused = !paused;
  boardSection.classList.toggle("disabled");
})

// Get hint
document.querySelector(".hint").addEventListener("click", () => {
  let row = Math.floor(Math.random() * 8);
  let col = Math.floor(Math.random() * 8);
  while(boardSection.children[row * 9 + col].textContent !== "") {
    row = Math.floor(Math.random() * 8);
    col = Math.floor(Math.random() * 8);
  }
  const hintValue = l_oFirstBoard.board[row][col];
  boardSection.children[row * 9 + col].textContent = hintValue;
  updataRemainings(hintValue, --remainings[hintValue - 1])
})