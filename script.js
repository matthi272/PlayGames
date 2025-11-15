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

  const { index } = findBestMove(boardState, botSymbol);
  const moveIndex =
    index !== null ? index : boardState.findIndex((cell) => cell === '');

  updateCell(moveIndex, botSymbol);

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

function checkWinner(symbol, state = boardState) {
  return winningCombos.some((combo) =>
    combo.every((index) => state[index] === symbol)
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

function findBestMove(state, currentPlayer) {
  let bestScore = -Infinity;
  let bestMove = null;

  state.forEach((cell, index) => {
    if (cell !== '') return;

    const newState = [...state];
    newState[index] = currentPlayer;
    const score = minimax(newState, 0, false);

    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  });

  return { index: bestMove, score: bestScore };
}

function minimax(state, depth, isMaximizing) {
  if (checkWinner(botSymbol, state)) {
    return 10 - depth;
  }
  if (checkWinner(playerSymbol, state)) {
    return depth - 10;
  }
  if (state.every((cell) => cell !== '')) {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < state.length; i += 1) {
      if (state[i] !== '') continue;
      state[i] = botSymbol;
      const score = minimax(state, depth + 1, false);
      state[i] = '';
      bestScore = Math.max(bestScore, score);
    }
    return bestScore;
  }

  let bestScore = Infinity;
  for (let i = 0; i < state.length; i += 1) {
    if (state[i] !== '') continue;
    state[i] = playerSymbol;
    const score = minimax(state, depth + 1, true);
    state[i] = '';
    bestScore = Math.min(bestScore, score);
  }
  return bestScore;
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
const memoryStatus = document.querySelector('#memory-match .memory-status');
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
  memoryStatus.className = 'memory-status';
  memoryStatus.textContent = 'Finde passende Meteore!';
  memoryBoard.innerHTML = '';

  cardValues.forEach((icon, index) => {
    const card = document.createElement('button');
    card.className = 'memory-card';
    card.type = 'button';
    card.dataset.icon = icon;
    card.disabled = false;
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
    memoryStatus.className = 'memory-status warning';
    memoryStatus.textContent = 'Nicht ganz – versuch es nochmal!';
    setTimeout(unflipCards, 900);
  }
}

function handleMatch() {
  [firstCard, secondCard].forEach((card) => {
    card.classList.add('matched');
    card.disabled = true;
  });
  matches += 1;
  matchesSpan.textContent = matches;
  const remaining = icons.length - matches;
  if (remaining > 0) {
    memoryStatus.className = 'memory-status success';
    memoryStatus.textContent = `Treffer! Noch ${remaining} ${remaining === 1 ? 'Paar' : 'Paare'} übrig.`;
  } else {
    memoryStatus.className = 'memory-status success';
    memoryStatus.textContent = `Sternenregen! Du hast alle Paare in ${moves} Zügen gefunden.`;
  }
  resetTurn();
}

function unflipCards() {
  firstCard.classList.remove('flipped');
  secondCard.classList.remove('flipped');
  memoryStatus.className = 'memory-status';
  memoryStatus.textContent = 'Weiter geht die Meteorenjagd!';
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
    if (target === 'akinator') {
      startAkinator();
    }
  });
});

// Akinator
const akinatorQuestionEl = document.querySelector('.akinator-question');
const akinatorStatusEl = document.querySelector('.akinator-status');
const akinatorAnswerButtons = document.querySelectorAll('.akinator-answer');

const akinatorQuestions = [
  { key: 'isHuman', text: 'Ist deine Figur ein Mensch?' },
  { key: 'usesMagic', text: 'Verwendet deine Figur kosmische Magie?' },
  { key: 'isRobot', text: 'Handelt es sich um einen Roboter oder eine KI?' },
  { key: 'isVillain', text: 'Ist deine Figur eher böse eingestellt?' },
  { key: 'hasSpaceship', text: 'Besitzt deine Figur ein eigenes Raumschiff?' },
];

const akinatorCharacters = [
  {
    name: 'Luna, die Sternenpiratin',
    traits: { isHuman: true, usesMagic: false, isRobot: false, isVillain: true, hasSpaceship: true },
  },
  {
    name: 'Orion, der Galaxienhüter',
    traits: { isHuman: true, usesMagic: true, isRobot: false, isVillain: false, hasSpaceship: false },
  },
  {
    name: 'XR-77, der Astro-Droide',
    traits: { isHuman: false, usesMagic: false, isRobot: true, isVillain: false, hasSpaceship: true },
  },
  {
    name: 'Nyra, die Nebelhexe',
    traits: { isHuman: false, usesMagic: true, isRobot: false, isVillain: true, hasSpaceship: false },
  },
  {
    name: 'Captain Sol, der Lichtpilot',
    traits: { isHuman: true, usesMagic: false, isRobot: false, isVillain: false, hasSpaceship: true },
  },
];

let akinatorRemaining = [];
let akinatorQuestionIndex = 0;
let akinatorAwaitingConfirmation = false;
let akinatorCurrentGuess = null;

function startAkinator() {
  akinatorRemaining = [...akinatorCharacters];
  akinatorQuestionIndex = 0;
  akinatorAwaitingConfirmation = false;
  akinatorCurrentGuess = null;
  akinatorStatusEl.textContent =
    'Denk dir eine Figur aus dem All und beantworte meine Fragen mit Ja, Nein oder Nicht sicher.';
  akinatorAnswerButtons.forEach((button) => {
    button.disabled = false;
  });
  showNextAkinatorStep();
}

function showNextAkinatorStep() {
  if (akinatorRemaining.length === 0) {
    akinatorQuestionEl.textContent = 'Ich bin ratlos! Welche Figur hattest du im Kopf?';
    akinatorStatusEl.textContent =
      'Du hast mich geschlagen – klicke auf "Nochmal versuchen", um es erneut zu probieren!';
    akinatorAnswerButtons.forEach((button) => {
      button.disabled = true;
    });
    return;
  }

  if (akinatorRemaining.length === 1 || akinatorQuestionIndex >= akinatorQuestions.length) {
    akinatorAwaitingConfirmation = true;
    akinatorCurrentGuess = akinatorRemaining[0];
    akinatorQuestionEl.textContent = `Ist deine Figur ${akinatorCurrentGuess.name}?`;
    akinatorStatusEl.textContent = 'Ich wage eine Vermutung … liege ich richtig?';
    return;
  }

  const currentQuestion = akinatorQuestions[akinatorQuestionIndex];
  akinatorQuestionEl.textContent = currentQuestion.text;
  akinatorStatusEl.textContent = `Ich habe noch ${akinatorRemaining.length} mögliche Figuren im Blick.`;
}

function handleAkinatorAnswer(answer) {
  if (akinatorAnswerButtons[0].disabled) {
    return;
  }

  if (akinatorAwaitingConfirmation) {
    const normalized = answer === 'maybe' ? 'no' : answer;

    if (normalized === 'yes') {
      akinatorStatusEl.textContent = 'Yeah! Ich wusste, dass ich richtig liege. Spiele gerne nochmal!';
      akinatorAnswerButtons.forEach((button) => {
        button.disabled = true;
      });
      return;
    }

    akinatorRemaining = akinatorRemaining.filter(
      (character) => character.name !== akinatorCurrentGuess.name
    );

    akinatorAwaitingConfirmation = false;
    akinatorCurrentGuess = null;
    akinatorQuestionIndex += 1;
    showNextAkinatorStep();
    return;
  }

  const currentQuestion = akinatorQuestions[akinatorQuestionIndex];
  if (!currentQuestion) {
    showNextAkinatorStep();
    return;
  }

  if (answer === 'yes') {
    akinatorRemaining = akinatorRemaining.filter(
      (character) => character.traits[currentQuestion.key] === true
    );
  } else if (answer === 'no') {
    akinatorRemaining = akinatorRemaining.filter((character) => {
      const trait = character.traits[currentQuestion.key];
      return trait === false || trait === undefined;
    });
  }

  akinatorQuestionIndex += 1;
  showNextAkinatorStep();
}

akinatorAnswerButtons.forEach((button) => {
  button.addEventListener('click', () => {
    handleAkinatorAnswer(button.dataset.answer);
  });
});

startAkinator();
