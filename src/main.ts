import { GameManager } from './game-manager.ts';

const gameManager = new GameManager(
  '#canvas',
  {
    scoreUpdate: (newValue: number) => {
      console.log(newValue)
    }
  }
);
gameManager.start()
setInterval(() => {
  console.log(gameManager.score)
}, 2000)
