const pieceMap = new Map();
let timerInterval;

function updateBoard() {
  let hasWon = true;
  for (let pieceIndex = 0; pieceIndex < 16; pieceIndex++) {
    const currentPiece = document.getElementsByClassName("square")[pieceIndex];
    currentPiece.dataset.value = pieceMap.get(pieceIndex);
    currentPiece.textContent = pieceMap.get(pieceIndex);
    if (pieceMap.get(pieceIndex) !== pieceIndex + 1 && pieceMap.get(pieceIndex) !== " ") hasWon = false;
    currentPiece.dataset.status = pieceMap.get(pieceIndex) === pieceIndex + 1 ? "correct" : "wrong";
  }
  if (!hasWon) return;
  
  clearInterval(timerInterval);
  let button = document.createElement("button")
  button.textContent = "play again";
  document.body.append(button)
  document.querySelector("button").onclick = function() {
    initializeMap();
  }
}

function initializeMap() {
  if (document.querySelector("button")) document.querySelector("button").remove()
  document.getElementById("timer").innerText = 0;
  let availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, " "];
  for (let i = 0; i < 16; i++) {
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const randomNumber = availableNumbers[randomIndex];
    pieceMap.set(i, randomNumber);
    availableNumbers.splice(randomIndex, 1);
    if (document.getElementById("board").children.length !== 16) {
      const square = document.createElement("div");
      square.className = "square";
      document.getElementById("board").append(square);
    }
  }
  updateBoard();
}

initializeMap();

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowDown": swapPieces(-4); break;
    case "ArrowRight": swapPieces(-1); break;
    case "ArrowLeft": swapPieces(1); break;
    case "ArrowUp": swapPieces(4); break;
  }
})

function timer() {
  let currentTime = 0;
  timerInterval = setInterval(() => {
    currentTime += 0.1;
    document.getElementById("timer").innerText = currentTime.toFixed(1);
  }, 100);
}

function swapPieces(offset) {
  if (document.getElementById("timer").innerText == 0) timer();
  const blankIndex = getKey(" ");

  // return if there is no valid piece at the offset position
  if ((blankIndex + 1) % 4 === 0 && offset === 1) return; // right
  else if (blankIndex > 11 && offset === 4) return;       // bottom
  else if (blankIndex % 4 === 0 && offset === -1) return; // left
  else if (blankIndex < 4 && offset === -4) return;       // up

  const movingIndex = blankIndex + offset;
  pieceMap.set(blankIndex, pieceMap.get(movingIndex));
  pieceMap.set(movingIndex, " ");

  /*
  setTimeout(() => {
    
    pieceMap.set(0, 1)
    pieceMap.set(1, 2)
    pieceMap.set(2, 3)
    pieceMap.set(3, 4)
    pieceMap.set(4, 5)
    pieceMap.set(5, 6)
    pieceMap.set(6, 7)
    pieceMap.set(7, 8)
    pieceMap.set(8, 9)
    pieceMap.set(9, 10)
    pieceMap.set(10, 11)
    pieceMap.set(11, 12)
    pieceMap.set(12, 13)
    pieceMap.set(13, 14)
    pieceMap.set(14, 15)
    pieceMap.set(15, " ")
  }, 1000);
  */
 
 updateBoard()

  function getKey(val) {
    return [...pieceMap].find(([key, value]) => val === value)[0];
  }
}