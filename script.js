const selectorButtons = document.querySelectorAll('.selector-button');
const games = document.querySelectorAll('.game');
const restartButtons = document.querySelectorAll('.restart');

selectorButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectorButtons.forEach((btn) => btn.classList.remove('active'));
    games.forEach((game) => game.classList.remove('active'));

    button.classList.add('active');
    const target = document.getElementById(button.dataset.target);
    target.classList.add('active');
  });
});

// Tic Tac Toe
const ticTacToeBoard = document.querySelector('.tic-tac-toe-board');
const ticTacToeStatus = document.querySelector('#tic-tac-toe .status');
const ticTacToeRestart = document.querySelector('.restart[data-game="tic-tac-toe"]');
const playerSymbol = '✦';
const botSymbol = '☄️';
let boardState = Array(9).fill('');
let isPlayerTurn = true;
let gameActive = true;

function createTicTacToeBoard() {
  ticTacToeBoard.innerHTML = '';
  boardState = Array(9).fill('');
  isPlayerTurn = true;
  gameActive = true;
  ticTacToeStatus.textContent = 'Du bist am Zug. Wähle ein Feld!';

  for (let i = 0; i < 9; i += 1) {
    const cell = document.createElement('button');
    cell.className = 'tic-tac-toe-cell';
    cell.type = 'button';
    cell.dataset.index = i;
    cell.setAttribute('role', 'gridcell');
    cell.addEventListener('click', handlePlayerMove);
    ticTacToeBoard.appendChild(cell);
  }
}

function handlePlayerMove(event) {
  if (!gameActive || !isPlayerTurn) return;
  const index = Number(event.currentTarget.dataset.index);
  if (boardState[index]) return;

  updateCell(index, playerSymbol);
  if (checkWinner(playerSymbol)) {
    endTicTacToe('Glückwunsch! Du hast gewonnen!');
    highlightWinningCells(playerSymbol);
    return;
  }

  if (boardState.every((cell) => cell)) {
    endTicTacToe('Unentschieden! Niemand dominiert die Galaxie.');
    return;
  }

  isPlayerTurn = false;
  ticTacToeStatus.textContent = 'Bot denkt nach…';

  setTimeout(() => {
    botMove();
  }, 600);
}

function botMove() {
  if (!gameActive) return;
  const availableMoves = boardState
    .map((value, index) => (value === '' ? index : null))
    .filter((value) => value !== null);

  const randomIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
  updateCell(randomIndex, botSymbol);

  if (checkWinner(botSymbol)) {
    highlightWinningCells(botSymbol);
    endTicTacToe('Der Bot gewinnt dieses Gefecht. Versuch es gleich nochmal!');
    return;
  }

  if (boardState.every((cell) => cell)) {
    endTicTacToe('Unentschieden! Niemand dominiert die Galaxie.');
    return;
  }

  isPlayerTurn = true;
  ticTacToeStatus.textContent = 'Du bist wieder dran!';
}

function updateCell(index, symbol) {
  boardState[index] = symbol;
  const cell = ticTacToeBoard.querySelector(`[data-index="${index}"]`);
  cell.textContent = symbol;
  cell.disabled = true;
}

const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(symbol) {
  return winningCombos.some((combo) =>
    combo.every((index) => boardState[index] === symbol)
  );
}

function highlightWinningCells(symbol) {
  winningCombos.forEach((combo) => {
    if (combo.every((index) => boardState[index] === symbol)) {
      combo.forEach((index) => {
        const cell = ticTacToeBoard.querySelector(`[data-index="${index}"]`);
        cell.classList.add('winning');
      });
    }
  });
}

function endTicTacToe(message) {
  gameActive = false;
  ticTacToeStatus.textContent = message;
}

ticTacToeRestart.addEventListener('click', createTicTacToeBoard);
createTicTacToeBoard();

// Number Guess
const guessForm = document.querySelector('.guess-form');
const guessInput = document.querySelector('#guess-input');
const feedback = document.querySelector('.guess-stats .feedback');
const attemptsSpan = document.querySelector('.attempts span');
const numberGuessRestart = document.querySelector('.restart[data-game="number-guess"]');
let secretNumber = getRandomNumber(1, 100);
let attempts = 0;

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resetNumberGuess() {
  secretNumber = getRandomNumber(1, 100);
  attempts = 0;
  attemptsSpan.textContent = attempts;
  feedback.textContent = 'Starte das Spiel mit deinem ersten Tipp!';
  feedback.className = 'feedback';
  guessInput.value = '';
  guessInput.focus();
}

function handleGuess(event) {
  event.preventDefault();
  const guessValue = Number(guessInput.value);
  if (!guessValue) {
    feedback.textContent = 'Bitte gib eine Zahl ein!';
    feedback.className = 'feedback warning';
    return;
  }

  if (guessValue < 1 || guessValue > 100) {
    feedback.textContent = 'Die Zahl muss zwischen 1 und 100 liegen.';
    feedback.className = 'feedback warning';
    return;
  }

  attempts += 1;
  attemptsSpan.textContent = attempts;

  if (guessValue === secretNumber) {
    feedback.textContent = `Galaktisch! ${guessValue} ist korrekt. Du hast ${attempts} Versuche gebraucht.`;
    feedback.className = 'feedback success';
  } else if (guessValue < secretNumber) {
    feedback.textContent = 'Zu niedrig! Schau weiter nach den Sternen.';
    feedback.className = 'feedback danger';
  } else {
    feedback.textContent = 'Zu hoch! Du bist über das Ziel hinausgeschossen.';
    feedback.className = 'feedback danger';
  }

  guessInput.value = '';
  guessInput.focus();
}

guessForm.addEventListener('submit', handleGuess);
numberGuessRestart.addEventListener('click', resetNumberGuess);

// Memory Match
const memoryBoard = document.querySelector('.memory-board');
const matchesSpan = document.querySelector('#memory-match .matches span');
const movesSpan = document.querySelector('#memory-match .moves span');
const memoryRestart = document.querySelector('.restart[data-game="memory-match"]');
const icons = ['🚀', '🪐', '☄️', '👾', '🌌', '🛰️', '🌠', '🛸'];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matches = 0;
let moves = 0;

function createMemoryBoard() {
  const cardValues = shuffle([...icons, ...icons]);
  matches = 0;
  moves = 0;
  matchesSpan.textContent = matches;
  movesSpan.textContent = moves;
  memoryBoard.innerHTML = '';

  cardValues.forEach((icon, index) => {
    const card = document.createElement('button');
    card.className = 'memory-card';
    card.type = 'button';
    card.dataset.icon = icon;
    card.innerHTML = `
      <div class="memory-card-inner">
        <div class="memory-card-face front">${icon}</div>
        <div class="memory-card-face back">✶</div>
      </div>
    `;
    card.addEventListener('click', () => flipCard(card));
    memoryBoard.appendChild(card);
  });

  resetTurn();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function flipCard(card) {
  if (lockBoard || card === firstCard || card.classList.contains('matched')) {
    return;
  }

  card.classList.add('flipped');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;
  moves += 1;
  movesSpan.textContent = moves;

  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;
  if (isMatch) {
    handleMatch();
  } else {
    setTimeout(unflipCards, 900);
  }
}

function handleMatch() {
  firstCard.classList.add('matched');
  secondCard.classList.add('matched');
  matches += 1;
  matchesSpan.textContent = matches;
  if (matches === icons.length) {
    setTimeout(() => {
      alert(`Du hast alle Paare gefunden! Benötigte Züge: ${moves}.`);
    }, 400);
  }
  resetTurn();
}

function unflipCards() {
  firstCard.classList.remove('flipped');
  secondCard.classList.remove('flipped');
  resetTurn();
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

memoryRestart.addEventListener('click', createMemoryBoard);
resetNumberGuess();
createMemoryBoard();

restartButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.game;
    if (target === 'tic-tac-toe') {
      createTicTacToeBoard();
    }
    if (target === 'number-guess') {
      resetNumberGuess();
    }
    if (target === 'memory-match') {
      createMemoryBoard();
    }
  });
});
