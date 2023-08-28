let pieceMap = new Map();
let boardsize = 4;
let movements, gameInfo, timerInterval, currentTime;
let colors = {};

function updateBoard() {
  document.getElementById("copy-history").disabled = true;
  let hasWon = true;
  for (let pieceIndex = 0; pieceIndex < (boardsize * boardsize); pieceIndex++) {
    const currentPiece = document.getElementsByClassName("hitbox")[pieceIndex];
    currentPiece.dataset.value = pieceMap.get(pieceIndex);
    currentPiece.innerText = pieceMap.get(pieceIndex);
    if (pieceMap.get(pieceIndex) !== pieceIndex + 1 && pieceMap.get(pieceIndex) !== " ") hasWon = false;
    currentPiece.dataset.status = pieceMap.get(pieceIndex) === pieceIndex + 1 ? "correct" : "wrong";
  }
  if (!hasWon) return;
  
  clearInterval(timerInterval);
  document.getElementById("view-history-button").disabled = false;
  document.getElementById("copy-history").disabled = false;

  if (!!document.getElementById("retry")) return;
  let button = document.createElement("button")
  button.setAttribute("id", "retry");
  button.textContent = "play again";
  button.style = "position: absolute; bottom: 0;"
  document.body.append(button);
  document.getElementById("retry").onclick = function() {
    initializeMap();
  }
}

function initializeMap() {
  colors = {};
  document.querySelector(':root').style.setProperty('--width', boardsize);
  document.getElementById("board").innerHTML = "";
  gameInfo = {
    "scramble": null,
    "movements": new Map()
  };
  if (document.getElementById("retry")) document.getElementById("retry").remove()
  document.getElementById("timer").innerText = "Move a piece to start the timer";
  for (let i = 0; i < (boardsize * boardsize); i++) {
    if (i !== (boardsize * boardsize - 1)) pieceMap.set(i, i + 1);
    else pieceMap.set((boardsize * boardsize - 1), " ");
    //add squares to the board
    const square = document.createElement("div");
    square.className = "square";
    const hitbox = document.createElement("div");
    hitbox.className = "hitbox";
    square.appendChild(hitbox);
    document.getElementById("board").appendChild(square);
  }

  // scramble the board
  const values = [(boardsize * -1), -1, 1, boardsize];
  for (let i = 0; i < 1000; i++) {
    const offset = values[Math.floor(Math.random() * values.length)];
    swapPieces(offset, false);
  }
  gameInfo.scramble = new Map(pieceMap);
  updateBoard();

  // creates the colors
  for (let i = 0; i < boardsize - 1; i++) {
    const fraction = i / (boardsize - 1);
    colors[`${i}`] = `hsl(${fraction * 360}, 55%, 50%)`;
  }
  setColorType("fringe");
  startEventListening();
}

initializeMap();

function timer() {
  let startTime = new Date().getTime();
  let timerElement = document.getElementById("timer");

  function updateTimer() {
    let currentTime = new Date().getTime();
    let elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
    timerElement.innerText = elapsedTime.toFixed(2);
  }

  updateTimer(); // Update the timer immediately
  timerInterval = setInterval(updateTimer, 10); // Update the timer every 10 milliseconds
}

function swapPieces(offset, hasStarted) {
  if (document.getElementById("timer").innerText == "Move a piece to start the timer" && hasStarted) {
    timer();
    currentTime = new Date().getTime();
  } 
  const blankIndex = getKey(" ");

  // return if there is no valid piece at the offset position
  if ((blankIndex + 1) % boardsize === 0 && offset === 1) return;                                 // right
  else if (blankIndex > (boardsize * boardsize - boardsize - 1) && offset === boardsize) return;  // bottom
  else if (blankIndex % boardsize === 0 && offset === -1) return;                                 // left
  else if (blankIndex < boardsize && offset === (boardsize * -1)) return;                         // up

  const movingIndex = blankIndex + offset;
  pieceMap.set(blankIndex, pieceMap.get(movingIndex));
  pieceMap.set(movingIndex, " ");
 
  if (hasStarted) {
    const newTime = new Date().getTime();
    const difference = newTime - currentTime;
    gameInfo.movements.set(difference, offset);
    updateBoard();
    setColorType("fringe");
  } 
}

function startEventListening() {
  // keyboard
  document.addEventListener("keydown", whenKeyPress)
  
  //mouse
  document.querySelectorAll(".hitbox").forEach((square) => {
    square.addEventListener("mouseenter", whenMouseEnter)
  })
  
  // touch
  document.getElementById("board").addEventListener("touchmove", whenTouch)
}

function stopEventListening() {
  // keyboard
  document.removeEventListener("keydown", whenKeyPress)

  //mouse
  document.querySelectorAll(".hitbox").forEach((square) => {
    square.removeEventListener("mouseenter", whenMouseEnter)
  })
  
  // touch
  document.getElementById("board").removeEventListener("touchmove", whenTouch)
}


function whenKeyPress(event) {
  switch (event.key) {
    case "ArrowDown": swapPieces((boardsize * -1), true); break;
    case "ArrowRight": swapPieces(-1, true); break;
    case "ArrowLeft": swapPieces(1, true); break;
    case "ArrowUp": swapPieces(boardsize, true); break;
  }
}

function whenMouseEnter(event) {
  const element = event.target;
  hover(element);
}

function whenTouch(event) {
  const clientX = event.touches[0].clientX;
  const clientY = event.touches[0].clientY;
  const element = document.elementFromPoint(clientX, clientY)
  if (element.className !== "hitbox" || element.dataset.value === " ") return; 
  hover(element)
} 

function hover(element) {
  const elementValue = element.dataset.value;
  if (elementValue === " ") return;
  const elementIndex = getKey(Number(elementValue));
  const blankIndex = getKey(" ");
  if (elementIndex + 1 === blankIndex) swapPieces(-1, true);                            // right (blank piece goes left)
  else if (elementIndex + boardsize === blankIndex) swapPieces((boardsize * -1), true); // bottom
  else if (elementIndex - 1 === blankIndex) swapPieces(1, true);                        // left
  else if (elementIndex - boardsize === blankIndex) swapPieces(boardsize, true);        // up
}

function getKey(val) {
  return [...pieceMap].find(([key, value]) => val === value)[0];
}

function setColorType(type) {
  for (let i = 0; i < (boardsize * boardsize); i++) {
    const squareValue = pieceMap.get(i);
    if (squareValue === (" ")) {
      document.querySelector(`.hitbox[data-value=" "]`).parentElement.style.backgroundColor = "";
      continue;
    } 
    const colorKey = [(squareValue - 1) % boardsize, Math.floor((squareValue - 1) / boardsize)].sort()[0];
    document.querySelector(`.hitbox[data-value="${squareValue}"]`).parentElement.style.backgroundColor = colors[colorKey];
  }
}

function win() {
  for (let i = 0; i < (boardsize * boardsize); i++) {
    if (i === (boardsize * boardsize - 1)) pieceMap.set(i, " ")
    else pieceMap.set(i, i + 1);
  }
  updateBoard()
}

function showSettings() {
	let settingsPane = document.getElementById("settings-pane");
	let settingsButton = document.getElementById("settings-button");
	settingsPane.style.display = "block";
	settingsButton.style.display = "none";
}

function closeSettings() {
  let settingsPane = document.getElementById("settings-pane");
  let settingsButton = document.getElementById("settings-button");
  settingsPane.style.display = "none";
  settingsButton.style.display = "grid";
  
  let gap = document.getElementById("squareGap").value;
  let borderRadius = document.getElementById("squareBorderRadius").value;
  let fontName = document.getElementById("fontName").value;
  let fontSize = document.getElementById("fontSize").value;
  let enableBoardBackdrop = document.getElementById("enableBoardBackdrop").checked ? 1 : 0;
  let boardBackdropColor = document.getElementById("boardBackdropColor").value;
  
  console.log(encodeSettings(gap, borderRadius, fontName, fontSize, enableBoardBackdrop, boardBackdropColor));
}



// add more settings to arguments in the future
function encodeSettings(gap, borderRadius, fontName, fontSize, boardBackdropEnabled, boardBackdropColor) {
	let settings = {
		"gap": gap,
		"borderRadius": borderRadius,
		"fontName": fontName,
		"fontSize": fontSize,
		"boardBackdropEnabled": boardBackdropEnabled,
		"boardBackdropColor": boardBackdropColor
	}
	return btoa(JSON.stringify(settings));
}

function loadSettings(settingsString) {
	settings = JSON.parse(atob(settingsString))
	customizeGap(settings.gap);
	customizeBorderRadius(settings.borderRadius);
}

function customizeGap(n) {
	document.getElementById("board").style.gap = `${n}px`;
}

function customizeBorder(width, type, color) {
	if (color.charAt(0) !== '#') {
        color = `#${color}`;
    }
	var squares = document.getElementsByClassName("square");
	for (var i = 0; i < squares.length; i++) {
		squares[i].style.border = `${width}px ${type} ${color}`;
	}
}

function customizeBorderRadius(n) {
	var squares = document.getElementsByClassName("square");
	for (var i = 0; i < squares.length; i++) {
		squares[i].style.borderRadius = `${n}px`;
	}
}

function enableBoardBackdrop(n) {
    document.getElementById("board").style.backgroundColor = n ? getComputedStyle(document.documentElement).getPropertyValue('--board-background-color') : "#0000";
}


function customizeBoardBackdrop(color) {
    if (color.charAt(0) !== '#') {
        color = `#${color}`;
    }
	document.documentElement.style.setProperty('--board-background-color', color);
    document.getElementById("board").style.backgroundColor = color;
}

function customizeFont(fontName) { 
	var squares = document.getElementsByClassName("square");
	for (var i = 0; i < squares.length; i++) {
		squares[i].style.fontFamily = `${fontName}, Arial, Helvetica, sans-serif`;
	}
}

function customizeFontSize(fontSize) { 
	var squares = document.getElementsByClassName("square");
	for (var i = 0; i < squares.length; i++) {
		squares[i].style.fontSize = `${fontSize}px`;
	}
}

function viewHistory() {
  document.getElementById("view-history-button").disabled = true;
  const encodedHistory = document.getElementById("encoded-history").value;
  // the scramble and history are still stringified though
  const decodedHisotry = JSON.parse(atob(encodedHistory));

  // fully parsed
  const history = {
    "scramble": JSON.parse(decodedHisotry.scramble),
    "movements": JSON.parse(decodedHisotry.movements)
  }

  console.log(history.movements)

  // look at the length of the scramble to find the boardsize
  boardsize = Math.sqrt(Object.keys(history.scramble).length);
  initializeMap();
  stopEventListening();

  // hack to make sure that the keys in pieceMap is a number
  for (const a in history.scramble) {
    pieceMap.set(Number(a), history.scramble[`${a}`])
  }
  updateBoard();
  setColorType();

  let timeout = 0;
  let previousTimestamp = Number(Object.keys(history.movements)[0]);
  const multiplier = document.getElementById("speed-multiplier").value;

  for (const move in history.movements) {
    timestamp = Number(move);
    const difference = timestamp - previousTimestamp;
    //console.log(difference)
    timeout += difference;
    setTimeout(() => {      
      // console.log(history.movements[`${move}`])
      swapPieces(history.movements[`${move}`], true)
    }, timeout / multiplier);
    previousTimestamp = Number(move);
  }
}

function copyHistory() {
  // first we stringify thsese things because btoa (the thing that encodes it to base 64) only accepts strings
  const stringifiedScramble = JSON.stringify(Object.fromEntries(gameInfo.scramble));
  const stringifiedMovements = JSON.stringify(Object.fromEntries(gameInfo.movements));
  const stringifiedGameInfo = JSON.stringify(
    {
      "scramble": stringifiedScramble,
      "movements": stringifiedMovements
    }
  )
  const base64GameInfo = btoa(stringifiedGameInfo);
  navigator.clipboard.writeText(base64GameInfo).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}