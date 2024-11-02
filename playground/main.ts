import Match3Preloader from '../src/game-manager'

let match3: Match3Preloader | null = null;

const startButton = document.getElementById('startButton') as HTMLButtonElement;
const stopButton = document.getElementById('stopButton') as HTMLButtonElement;
const scoreElement = document.getElementById('score') as HTMLDivElement;

function updateScore(newValue: number) {
  scoreElement.textContent = `Score: ${newValue}`;
}

function createGame() {
  match3 = new Match3Preloader('#gameCanvas', {}, {
    scoreUpdate: updateScore
  });
}

startButton.addEventListener('click', () => {
  if (!match3) {
    createGame();
  }
  match3?.start();
  startButton.disabled = true;
  stopButton.disabled = false;
});

stopButton.addEventListener('click', () => {
  match3?.stop();
  match3 = null;
  updateScore(0);
  startButton.disabled = false;
  stopButton.disabled = true;
});

// Initial state
stopButton.disabled = true;