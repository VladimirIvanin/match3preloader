import { Board } from './board';
import images from './images'

const CANVAS_SCALE = 0.5;
const CELL_SIZE = 200;

type GemInfo = {
  name: string
  src: string
  image: HTMLImageElement
}

export class CanvasService {
  ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  gems_info: GemInfo[]
  boardWidth: number
  boardHeight: number
  gems_images: Record<string, HTMLImageElement>
  handImage: HTMLImageElement
  hoverGemX: number | undefined
  hoverGemY: number | undefined
  activeGemX: number | undefined
  activeGemY: number | undefined
  isGemExchange: boolean

  constructor(selector: string, width: number, height: number, gems_info: GemInfo[]) {
    this.canvas = document.querySelector<HTMLCanvasElement>(selector)!;
    if (!this.canvas) { throw 'Wrong selector'; }
    this.ctx = this.canvas.getContext("2d")!;
    this.boardWidth = width;
    this.boardHeight = height;
    this.canvas.width = CELL_SIZE * this.boardWidth;
    this.canvas.height = CELL_SIZE * this.boardHeight;
    this.canvas.style.width = this.canvas.width * CANVAS_SCALE +'px';
    this.canvas.style.height = this.canvas.height * CANVAS_SCALE +'px';
    this.gems_info = gems_info;
    this.gems_images = {};
    this.handImage = new Image();
    this.isGemExchange = false;

    this.addEventListeners();
  }

  private addEventListeners() {
    this.canvas.addEventListener('mousemove', this.handlePointerMove.bind(this));
    this.canvas.addEventListener('mouseout', this.handlePointerOut.bind(this));
    this.canvas.addEventListener('mousedown', this.handlePointerDown.bind(this));
    this.canvas.addEventListener('mouseup', this.handlePointerUp.bind(this));

    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  private handlePointerMove(event: MouseEvent) {
    const { x, y } = this.getPointerPosition(event.clientX, event.clientY);
    this.updateHoverPosition(x, y);
  }

  private handleTouchMove(event: TouchEvent) {
    event.preventDefault();
    const touch = event.touches[0];
    const { x, y } = this.getPointerPosition(touch.clientX, touch.clientY);
    this.updateHoverPosition(x, y);
  }

  private handlePointerOut() {
    this.resetHoverPosition();
  }

  private handlePointerDown() {
    this.setActivePosition();
  }

  private handleTouchStart(event: TouchEvent) {
    event.preventDefault();
    const touch = event.touches[0];
    const { x, y } = this.getPointerPosition(touch.clientX, touch.clientY);
    this.updateHoverPosition(x, y);
    this.setActivePosition();
  }

  private handlePointerUp() {
    this.resetActivePosition();
  }

  private handleTouchEnd(event: TouchEvent) {
    event.preventDefault();
    this.resetHoverPosition();
    this.resetActivePosition();
  }

  private getPointerPosition(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) / (CANVAS_SCALE * CELL_SIZE));
    const y = this.boardHeight - 1 - Math.floor((clientY - rect.top) / (CANVAS_SCALE * CELL_SIZE));
    return { x, y };
  }

  private updateHoverPosition(x: number, y: number) {
    this.hoverGemX = x;
    this.hoverGemY = y;
  }

  private resetHoverPosition() {
    this.hoverGemX = undefined;
    this.hoverGemY = undefined;
  }

  private setActivePosition() {
    this.activeGemX = this.hoverGemX;
    this.activeGemY = this.hoverGemY;
    this.isGemExchange = true;
  }

  private resetActivePosition() {
    this.isGemExchange = false;
  }

  drawHand(x: number, y: number) {
    const scale = 0.8;
    const margin = (1 - scale) / 2;
    const xpixels = (margin + x) * CELL_SIZE;
    const ypixels = (this.boardHeight - 1 - y + margin) * CELL_SIZE + CELL_SIZE / 4;
    this.ctx.drawImage(this.handImage, xpixels, ypixels, CELL_SIZE * scale, CELL_SIZE * scale);
  }
  drawGem(x: number, y: number, gem_name: string, scale: number = 0.9) {
    const margin = (1 - scale) / 2;
    const xpixels = (margin + x) * CELL_SIZE;
    const ypixels = (this.boardHeight - 1 - y + margin) * CELL_SIZE;
    this.ctx.drawImage(this.gems_images[gem_name], xpixels, ypixels, CELL_SIZE * scale, CELL_SIZE * scale);
  }
  drawBoard(board: Board, exceptions: number[][] = []) {
    for(let x = 0; x < board.width; x++) {
      for(let y = 0; y < board.height; y++) {
        const gem = board.getGem(x, y);
        if (!gem) { continue; }
        if (exceptions.some((exception) => exception[0] == x && exception[1] == y)) { continue; }

        this.drawGem(x, y, gem);
      }
    }
  }
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  loadAssets() {
    const promiseList: Promise<void>[] = [];
    this.gems_info.forEach((gem) => {
      promiseList.push(new Promise<void>((resolve) => {
        gem.image.src = gem.src;
        gem.image.onload = () => {
          this.gems_images[gem.name] = gem.image;
          resolve();
        };
      }));
    })
    promiseList.push(new Promise<void>((resolve) => {
      this.handImage.src = images.hand;
      this.handImage.onload = () => { resolve(); };
    }));
    return Promise.all(promiseList);
  }
}
