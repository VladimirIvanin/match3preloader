import { Board } from './board';
import { CanvasService } from './canvas-service';
import images from './images'

const GEMS_INFO = [
  { name: "mails",
    src: images.mails,
    image: new Image()
  },
  { name: "reviews",
    src: images.reviews,
    image: new Image()
  },
  { name: "notifications",
    src: images.notifications,
    image: new Image()
  },
  { name: "carts",
    src: images.carts,
    image: new Image()
  },
  { name: "products",
    src: images.products,
    image: new Image()
  }
]
const BOARD_WIDTH = 5;
const BOARD_HEIGHT = 5;
const HELP_THRESHOLD = 5;

type Callbacks = {
  scoreUpdate?: ((score: number) => void)
}
type Options = {
  zeroScoreStart?: boolean
}

export default class GameManager {
  score: number
  playerInactiveTime: number
  private active: boolean
  private board: Board
  private canvasService: CanvasService
  private firstPlayerPhase: boolean
  private callbacks: Callbacks
  private zeroScoreStart: boolean
  constructor(selector: string, options?: Options, callbacks?: Callbacks) {
    this.board = new Board(BOARD_WIDTH, BOARD_HEIGHT, GEMS_INFO.map(gem => gem.name));
    this.canvasService = new CanvasService(selector, BOARD_WIDTH, BOARD_HEIGHT, GEMS_INFO);;
    this.active = false;
    this.score = 0;
    this.playerInactiveTime = 0;
    this.firstPlayerPhase = true;
    this.zeroScoreStart = !!options?.zeroScoreStart;
    this.callbacks = {
      scoreUpdate: callbacks?.scoreUpdate
    }
  }
  start() {
    if (this.active) { return; }
    this.firstPlayerPhase = true
    this.active = true
    if (this.zeroScoreStart) {
      this.board.makeZeroMatches()
    }
    this.canvasService.loadAssets().then(() => {
      this.dropPhase(this.zeroScoreStart)
    })
  }
  stop() {
    this.active = false
    requestAnimationFrame((_timeStamp) => {
      this.board = new Board(BOARD_WIDTH, BOARD_HEIGHT, GEMS_INFO.map(gem => gem.name));
      this.score = 0
      this.playerInactiveTime = 0
      this.firstPlayerPhase = true
      this.canvasService.clear();
    });
  }
  private addScore(addition: number) {
    this.score += addition
    if (this.callbacks.scoreUpdate) {
      this.callbacks.scoreUpdate(this.score);
    }
  }
  private dropPhase(precalculated?: boolean) {
    if (!precalculated) { this.board.recalculatePositions(); }

    let startTime: number = 0;
    const animate = (timeStamp: number) => {
      if (startTime === 0) { startTime = timeStamp; }
      const timeCounter: number = (timeStamp - startTime) / 150;
      let offset: number = 0.1;
      let animationFinished: boolean = true;

      this.canvasService.clear();
      for(let x = 0; x < this.board.width; x++) {
        for(let y = 0; y < this.board.height; y++) {
          const gem = this.board.getGem(x, y);
          if (!gem) { continue; }

          let timeline = timeCounter - offset;
          if (timeline < 0) { timeline = 0; }
          let height = this.board.getGemFallHeight(x, y) - timeline;
          if (height <= 0) { height = 0; }
          else { animationFinished = false; }
          this.canvasService.drawGem(x, y + height, gem);
          offset += 0.1 * y;
        }
      }
      if (animationFinished) {
        this.explosionPhase();
      } else {
        this.nextTick(animate);
      }
    }
    this.nextTick(animate);
  }
  private restartPhase() {
    let animationLength = 300;
    let startTime: number = 0;
    const animate = (timeStamp: number) => {
      if (startTime === 0) { startTime = timeStamp; }
      let timePercent = (animationLength + startTime - timeStamp) / animationLength;
      if (timePercent < 0) { timePercent = 0 }

      this.canvasService.clear();
      for(let x = 0; x < this.board.width; x++) {
        for(let y = 0; y < this.board.height; y++) {
          const gem = this.board.getGem(x, y)!
          this.canvasService.drawGem(x, y, gem, 0.9 * timePercent);
        }
      }

      if (timePercent === 0) {
        this.board.clearBoard();
        this.dropPhase();
      } else {
        this.nextTick(animate);
      }
    }
    this.nextTick(animate);
  }
  private explosionPhase() {
    const matches = this.board.getMatches();
    if (matches.length > 0) {
      this.addScore(matches.length * 100)
      let animationLength = 300;
      let startTime: number = 0;
      const animate = (timeStamp: number) => {
        if (startTime === 0) { startTime = timeStamp; }
        let timePercent = (animationLength + startTime - timeStamp) / animationLength;
        if (timePercent < 0) { timePercent = 0 }

        this.canvasService.clear();
        this.canvasService.drawBoard(this.board, matches);
        matches.forEach((match) => {
          const gem = this.board.getGem(match[0], match[1])
          if (!gem) { return; }
          this.canvasService.drawGem(match[0], match[1], gem, 0.9 * timePercent);
        })

        if (timePercent === 0) {
          this.board.sliceMatches();
          this.dropPhase();
        } else {
          this.nextTick(animate);
        }
      }
      this.nextTick(animate);
    } else {
      this.playerPhase();
    }
  }
  private playerPhase() {
    let possibleMatches = this.board.getPossibleMatch()
    if (!possibleMatches) {
      this.restartPhase();
      return;
    }
    const helpAnimationLength = 600;
    const handAnimationLength = 1200;
    let helpTimer = Date.now()
    let playerInactiveTime = 0;
    let showHelp = false;
    let helpStartTime = 0
    const listen = (timeStamp: number) => {
      playerInactiveTime += Date.now() - helpTimer
      helpTimer = Date.now()
      if (showHelp === false && (playerInactiveTime > HELP_THRESHOLD * 1000)) {
        showHelp = true
        helpStartTime = timeStamp;
      }

      const hoverGemX: number | undefined = this.canvasService.hoverGemX;
      const hoverGemY: number | undefined = this.canvasService.hoverGemY;
      const activeGemX: number | undefined = this.canvasService.activeGemX;
      const activeGemY: number | undefined = this.canvasService.activeGemY;
      this.canvasService.clear();
      const exceptions = hoverGemX != undefined && hoverGemY != undefined ? [[hoverGemX, hoverGemY]] : undefined;
      this.canvasService.drawBoard(this.board, exceptions);
      if (showHelp) {
        let timePercent = ((timeStamp - helpStartTime) % helpAnimationLength) / helpAnimationLength;
        if (timePercent <= 0.5) {
          timePercent *= 2
        } else {
          timePercent = (1 - timePercent) * 2
        }
        let nextGem = possibleMatches[0]
        this.canvasService.drawGem(nextGem.x, nextGem.y, nextGem.name, 0.9 + 0.1 * timePercent);
      }
      if (hoverGemX !== undefined && hoverGemY !== undefined) {
        const gemName = this.board.getGem(hoverGemX, hoverGemY)
        if (gemName !== undefined) {
          this.canvasService.drawGem(hoverGemX, hoverGemY, gemName, 1);
        }
      }
      if (this.firstPlayerPhase) {
        let timePercent = (timeStamp % handAnimationLength) / handAnimationLength;
        if (timePercent <= 0.5) {
          timePercent *= 2
        } else {
          timePercent = (1 - timePercent) * 2
        }
        let diffx = possibleMatches[1].x - possibleMatches[0].x;
        let diffy = possibleMatches[1].y - possibleMatches[0].y;
        this.canvasService.drawHand(possibleMatches[0].x + diffx * timePercent, possibleMatches[0].y + diffy * timePercent);
      }
      if (this.canvasService.isGemExchange && hoverGemX !== undefined && hoverGemY !== undefined && activeGemX !== undefined && activeGemY !== undefined) {
        let targetGemX: number, targetGemY: number
        if (Math.abs(hoverGemX - activeGemX) != Math.abs(hoverGemY - activeGemY)) {
          if (Math.abs(hoverGemX - activeGemX) > Math.abs(hoverGemY - activeGemY)) {
            targetGemX = activeGemX - Math.sign(activeGemX - hoverGemX);
            targetGemY = activeGemY;
          } else {
            targetGemX = activeGemX;
            targetGemY = activeGemY - Math.sign(activeGemY - hoverGemY);
          }
          this.canvasService.hoverGemX = undefined;
          this.canvasService.hoverGemY = undefined;
          this.canvasService.activeGemX = undefined;
          this.canvasService.activeGemY = undefined;
          this.canvasService.isGemExchange = false;

          this.firstPlayerPhase = false;
          this.gemMovePhase(targetGemX, targetGemY, activeGemX, activeGemY);
        } else {
          this.nextTick(listen);
        }
      } else {
        this.nextTick(listen);
      }
    }
    this.nextTick(listen);
  }
  private gemMovePhase(targetGemX: number, targetGemY: number, activeGemX: number, activeGemY: number) {
    const firstGem = this.board.getGem(activeGemX, activeGemY);
    const secondGem = this.board.getGem(targetGemX, targetGemY);
    if (firstGem === undefined || secondGem === undefined) {
      this.playerPhase();
      return;
    }
    this.board.setGem(activeGemX, activeGemY, secondGem);
    this.board.setGem(targetGemX, targetGemY, firstGem);

    const animation = (
      timeFuction: (timePercent: number) => [number, number],
      callback: () => void,
      animationLength: number
    ) => {
      let startTime: number = 0;
      const animate = (timeStamp: number) => {
        if (startTime === 0) { startTime = timeStamp; }
        let timeCounter = timeStamp - startTime;
        let timePercent = timeCounter / animationLength;

        const tArr: number[] = timeFuction(timePercent);
        let tPos: number = tArr[0];
        let tRot: number = tArr[1];

        this.canvasService.clear();
        this.canvasService.drawBoard(this.board, [[activeGemX, activeGemY], [targetGemX, targetGemY]]);
        this.canvasService.drawGem(targetGemX + (activeGemX - targetGemX) * tPos, targetGemY + (activeGemY - targetGemY) * tPos, secondGem, 0.9 * (1 - tRot / 5));
        this.canvasService.drawGem(activeGemX + (targetGemX - activeGemX) * tPos, activeGemY + (targetGemY - activeGemY) * tPos, firstGem, 0.9 * (1 + tRot / 10));

        if (timePercent >= 1) {
          callback();
        } else {
          this.nextTick(animate);
        }
      }
      animate(0);
    }

    if (this.board.getMatches().length > 0) {
      animation((timePercent: number): [number, number] => {
        const arr: [number, number] = [0, 0];
        if (timePercent <= 0.5) {
          arr[0] = timePercent;
          arr[1] = timePercent * 2;
        } else {
          arr[0] = timePercent;
          arr[1] = (0.5 - (timePercent - 0.5)) * 2;
        }
        return arr;
      }, () => {
        this.explosionPhase();
      }, 300);
    } else {
      animation((timePercent: number): [number, number] => {
        const arr: [number, number] = [0, 0];
        if (timePercent <= 0.25) {
          arr[0] = timePercent * 2;
          arr[1] = timePercent * 4;
        } else if (timePercent <= 0.5) {
          arr[0] = timePercent * 2;
          arr[1] = (0.25 - (timePercent - 0.25)) * 4;
        } else if (timePercent <= 0.75) {
          arr[0] = (0.5 - (timePercent - 0.5)) * 2;
          arr[1] = (timePercent - 0.5) * 4;
        } else {
          arr[0] = (0.5 - (timePercent - 0.5)) * 2;
          arr[1] = (0.25 - (timePercent - 0.75)) * 4;
        }
        return arr;
      }, () => {
        this.board.setGem(activeGemX, activeGemY, firstGem);
        this.board.setGem(targetGemX, targetGemY, secondGem);
        this.playerPhase();
      }, 600);
    }
  }
  private nextTick(fn: (timeStamp: number) => void) {
    if (!this.active) { return }
    requestAnimationFrame(fn);
  }
}
