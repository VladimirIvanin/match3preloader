import { Board } from './board';
import { CanvasService } from './canvas-service';
import { InputService } from './input-service';
import images from './images'

const GEMS_INFO = [
  { name: "mails", src: images.mails, image: new Image() },
  { name: "reviews", src: images.reviews, image: new Image() },
  { name: "notifications", src: images.notifications, image: new Image() },
  { name: "carts", src: images.carts, image: new Image() },
  { name: "products", src: images.products, image: new Image() }
];

const BOARD_WIDTH = 5;
const BOARD_HEIGHT = 5;
const HELP_THRESHOLD = 5;
const ANIMATION_LENGTH = 300;
const HAND_ANIMATION_LENGTH = 1200;

type Gem = {
  x: number;
  y: number;
  name: string;
};

type Callbacks = {
  scoreUpdate?: (score: number) => void;
}

export default class GameManager {
  private score = 0;
  private playerInactiveTime = 0;
  private active = false;
  private firstPlayerPhase = true;
  private lastFrame?: (timeStamp: number) => void;

  private board: Board;
  private canvasService: CanvasService;
  private inputService: InputService;
  private callbacks: Callbacks;

  constructor(selector: string, options?: object, callbacks?: Callbacks) {
    const gemNames = GEMS_INFO.map(gem => gem.name);
    this.board = new Board(BOARD_WIDTH, BOARD_HEIGHT, gemNames);
    this.canvasService = new CanvasService(selector, BOARD_WIDTH, BOARD_HEIGHT, GEMS_INFO);
    this.inputService = new InputService(this.canvasService);
    this.callbacks = { scoreUpdate: callbacks?.scoreUpdate };
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.firstPlayerPhase = true;
    this.board.makeZeroMatches();
    this.canvasService.loadAssets().then(() => this.dropPhase(true));
  }

  stop() {
    this.active = false;
    this.resetGame();
  }

  pause() {
    this.active = false;
    requestAnimationFrame(() => this.canvasService.clear());
  }

  resume() {
    if (this.active || !this.lastFrame) return;
    this.active = true;
    requestAnimationFrame(this.lastFrame);
    this.lastFrame = undefined;
  }

  private resetGame() {
    requestAnimationFrame(() => {
      this.lastFrame = undefined;
      this.board = new Board(BOARD_WIDTH, BOARD_HEIGHT, GEMS_INFO.map(gem => gem.name));
      this.score = 0;
      this.playerInactiveTime = 0;
      this.firstPlayerPhase = true;
      this.canvasService.clear();
    });
  }

  private addScore(addition: number) {
    this.score += addition;
    this.callbacks.scoreUpdate?.(this.score);
  }

  private dropPhase(precalculated = false) {
    if (!precalculated) this.board.recalculatePositions();
  
    let startTime = 0;
    const animate = (timeStamp: number) => {
      if (startTime === 0) startTime = timeStamp;
      const timeCounter = (timeStamp - startTime) / 150;
      let offset = 0.1;
      let animationFinished = true;
  
      this.canvasService.clear();
      this.board.forEachGem((x, y, gem) => {
        if (!gem) return;
  
        const timeline = Math.max(timeCounter - offset, 0);
        const height = Math.max(this.board.getGemFallHeight(x, y) - timeline, 0);
        if (height > 0) animationFinished = false;
        this.canvasService.drawGem(x, y + height, gem);
        offset += 0.1 * y;
      });
  
      if (animationFinished) {
        this.explosionPhase();
      } else {
        this.nextTick(animate);
      }
    };
    this.nextTick(animate);
  }

  private restartPhase() {
    let startTime = 0;
    const animate = (timeStamp: number) => {
      if (startTime === 0) startTime = timeStamp;
      const timePercent = Math.max((ANIMATION_LENGTH + startTime - timeStamp) / ANIMATION_LENGTH, 0);
  
      this.canvasService.clear();
      this.board.forEachGem((x, y, gem) => {
        this.canvasService.drawGem(x, y, gem, 0.9 * timePercent);
      });
  
      if (timePercent === 0) {
        this.resetAndDrop();
      } else {
        this.nextTick(animate);
      }
    };
    this.nextTick(animate);
  }

  private resetAndDrop() {
    this.board.clearBoard();
    this.dropPhase();
  }

  private explosionPhase() {
    const matches = this.board.getMatches();
    if (matches.length === 0) {
      this.playerPhase();
      return;
    }

    this.addScore(matches.length * 100);
    let startTime = 0;
    const animate = (timeStamp: number) => {
      if (startTime === 0) startTime = timeStamp;
      const timePercent = Math.max((ANIMATION_LENGTH + startTime - timeStamp) / ANIMATION_LENGTH, 0);

      this.canvasService.clear();
      this.canvasService.drawBoard(this.board, matches);
      matches.forEach(([x, y]) => {
        const gem = this.board.getGem(x, y);
        if (gem) this.canvasService.drawGem(x, y, gem, 0.9 * timePercent);
      });

      if (timePercent === 0) {
        this.handleExplosionEnd();
      } else {
        this.nextTick(animate);
      }
    };
    this.nextTick(animate);
  }

  private handleExplosionEnd() {
    this.board.sliceMatches();
    this.dropPhase();
  }

  private playerPhase() {
    const possibleMatches = this.board.getPossibleMatch();
    if (!possibleMatches) {
      this.restartPhase();
      return;
    }
  
    let helpTimer = Date.now();
    let playerInactiveTime = 0;
    let showHelp = false;
    let helpStartTime = 0;
  
    const listen = (timeStamp: number) => {
      playerInactiveTime += Date.now() - helpTimer;
      helpTimer = Date.now();
  
      if (!showHelp && playerInactiveTime > HELP_THRESHOLD * 1000) {
        showHelp = true;
        helpStartTime = timeStamp;
      }
  
      this.renderPlayerPhase(timeStamp, possibleMatches, showHelp, helpStartTime);
  
      if (this.shouldExchangeGems()) {
        this.handleGemExchange();
      } else {
        this.nextTick(listen);
      }
    };
    this.nextTick(listen);
  }
  private updateInactiveTime(helpTimer: number) {
    this.playerInactiveTime += Date.now() - helpTimer;
  }

  private renderPlayerPhase(timeStamp: number, possibleMatches: Gem[], showHelp: boolean, helpStartTime: number) {
    const { hoverGemX, hoverGemY } = this.inputService;
    this.canvasService.clear();
    const exceptions = hoverGemX !== undefined && hoverGemY !== undefined ? [[hoverGemX, hoverGemY]] : undefined;
    this.canvasService.drawBoard(this.board, exceptions);
  
    if (showHelp) this.renderHelp(timeStamp, helpStartTime, possibleMatches);
    if (hoverGemX !== undefined && hoverGemY !== undefined) this.renderHoverGem(hoverGemX, hoverGemY);
    if (this.firstPlayerPhase) this.renderHand(timeStamp, possibleMatches);
  }

  private renderHelp(timeStamp: number, helpStartTime: number, possibleMatches: Gem[]) {
    const timePercent = this.calculateAnimationPercent(timeStamp - helpStartTime, ANIMATION_LENGTH);
    const nextGem = possibleMatches[0];
    this.canvasService.drawGem(nextGem.x, nextGem.y, nextGem.name, 0.9 + 0.1 * timePercent);
  }

  private renderHoverGem(x: number, y: number) {
    const gemName = this.board.getGem(x, y);
    if (gemName !== undefined) {
      this.canvasService.drawGem(x, y, gemName, 1);
    }
  }

  private renderHand(timeStamp: number, possibleMatches: Gem[]) {
    const timePercent = this.calculateAnimationPercent(timeStamp, HAND_ANIMATION_LENGTH);
    const [start, end] = possibleMatches;
    const diffx = end.x - start.x;
    const diffy = end.y - start.y;
    this.canvasService.drawHand(start.x + diffx * timePercent, start.y + diffy * timePercent);
  }

  private calculateAnimationPercent(elapsed: number, duration: number): number {
    const rawPercent = (elapsed % duration) / duration;
    return rawPercent <= 0.5 ? rawPercent * 2 : (1 - rawPercent) * 2;
  }

  private shouldExchangeGems(): boolean {
    const { hoverGemX, hoverGemY, activeGemX, activeGemY, isGemExchange } = this.inputService;
    return isGemExchange && 
          hoverGemX !== undefined && hoverGemY !== undefined && 
          activeGemX !== undefined && activeGemY !== undefined;
  }

  private handleGemExchange() {
    const { hoverGemX, hoverGemY, activeGemX, activeGemY } = this.inputService;
    let targetGemX: number, targetGemY: number;

    if (Math.abs(hoverGemX! - activeGemX!) !== Math.abs(hoverGemY! - activeGemY!)) {
      if (Math.abs(hoverGemX! - activeGemX!) > Math.abs(hoverGemY! - activeGemY!)) {
        targetGemX = activeGemX! - Math.sign(activeGemX! - hoverGemX!);
        targetGemY = activeGemY!;
      } else {
        targetGemX = activeGemX!;
        targetGemY = activeGemY! - Math.sign(activeGemY! - hoverGemY!);
      }
      this.inputService.clearGems();
      this.firstPlayerPhase = false;
      this.gemMovePhase(targetGemX, targetGemY, activeGemX!, activeGemY!);
    } else {
      this.nextTick(this.playerPhase.bind(this));
    }
  }

  private gemMovePhase(targetGemX: number, targetGemY: number, activeGemX: number, activeGemY: number) {
    const [firstGem, secondGem] = this.getGemsForSwap(activeGemX, activeGemY, targetGemX, targetGemY);
    
    if (!this.areValidGems(firstGem, secondGem)) {
      this.playerPhase();
      return;
    }
  
    this.board.swapGems(activeGemX, activeGemY, targetGemX, targetGemY);
  
    const animationConfig = this.getGemMoveAnimationConfig(activeGemX, activeGemY, targetGemX, targetGemY);
    this.animateGemMove(firstGem!, secondGem!, activeGemX, activeGemY, targetGemX, targetGemY, animationConfig);
  }

  private getGemsForSwap(x1: number, y1: number, x2: number, y2: number): [string | undefined, string | undefined] {
    return [this.board.getGem(x1, y1), this.board.getGem(x2, y2)];
  }
  
  private areValidGems(gem1: string | undefined, gem2: string | undefined): boolean {
    return gem1 !== undefined && gem2 !== undefined;
  }
  
  private getGemMoveAnimationConfig(activeGemX: number, activeGemY: number, targetGemX: number, targetGemY: number) {
    if (this.board.getMatches().length > 0) {
      return this.getMatchAnimationConfig();
    } else {
      return this.getNoMatchAnimationConfig(activeGemX, activeGemY, targetGemX, targetGemY);
    }
  }

  private getMatchAnimationConfig() {
    return {
      duration: 300,
      timeFuction: (t: number): [number, number] => [t, t <= 0.5 ? t * 2 : (0.5 - (t - 0.5)) * 2],
      callback: () => this.explosionPhase()
    };
  }

  private getNoMatchAnimationConfig(activeGemX: number, activeGemY: number, targetGemX: number, targetGemY: number) {
    return {
      duration: 600,
      timeFuction: (t: number): [number, number] => {
        if (t <= 0.25) return [t * 2, t * 4];
        if (t <= 0.5) return [t * 2, (0.25 - (t - 0.25)) * 4];
        if (t <= 0.75) return [(0.5 - (t - 0.5)) * 2, (t - 0.5) * 4];
        return [(0.5 - (t - 0.5)) * 2, (0.25 - (t - 0.75)) * 4];
      },
      callback: () => {
        this.board.swapGems(activeGemX, activeGemY, targetGemX, targetGemY);
        this.playerPhase();
      }
    };
  }

  private animateGemMove(
    firstGem: string, 
    secondGem: string, 
    activeGemX: number, 
    activeGemY: number, 
    targetGemX: number, 
    targetGemY: number, 
    config: { duration: number, timeFuction: (t: number) => [number, number], callback: () => void }
  ) {
    let startTime = 0;
    const animate = (timeStamp: number) => {
      if (startTime === 0) startTime = timeStamp;
      const timePercent = (timeStamp - startTime) / config.duration;

      const [tPos, tRot] = config.timeFuction(timePercent);

      this.canvasService.clear();
      this.canvasService.drawBoard(this.board, [[activeGemX, activeGemY], [targetGemX, targetGemY]]);
      this.canvasService.drawGem(
        targetGemX + (activeGemX - targetGemX) * tPos, 
        targetGemY + (activeGemY - targetGemY) * tPos, 
        secondGem, 
        0.9 * (1 - tRot / 5)
      );
      this.canvasService.drawGem(
        activeGemX + (targetGemX - activeGemX) * tPos, 
        activeGemY + (targetGemY - activeGemY) * tPos, 
        firstGem, 
        0.9 * (1 + tRot / 0.9 * (1 + tRot / 10))
      );

      if (timePercent >= 1) {
        config.callback();
      } else {
        this.nextTick(animate);
      }
    }
    this.nextTick(animate);
  }

  private nextTick(callback: (timeStamp: number) => void) {
    if (!this.active) {
      this.lastFrame = callback;
      return;
    }
    requestAnimationFrame(callback);
  }
}