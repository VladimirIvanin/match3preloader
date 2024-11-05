import { CanvasService } from './canvas-service';

export class InputService {
  canvasService: CanvasService
  mouseEvents: boolean
  isGemExchange: boolean

  hoverGemX: number | undefined
  hoverGemY: number | undefined
  activeGemX: number | undefined
  activeGemY: number | undefined

  constructor(canvasService: CanvasService) {
    this.canvasService = canvasService
    this.mouseEvents = true
    this.isGemExchange = false

    this.hoverGemX = undefined
    this.hoverGemY = undefined
    this.activeGemX = undefined
    this.activeGemY = undefined

    this.canvasService.canvas.addEventListener('mousemove', (event) => {
      if (!this.mouseEvents) { return; }

      const gemPosition = this.canvasService.getCanvasGem(event.clientX, event.clientY)
      this.hoverGemX = gemPosition.x
      this.hoverGemY = gemPosition.y
    });

    this.canvasService.canvas.addEventListener('mouseout', () => {
      if (!this.mouseEvents) { return; }

      this.hoverGemX = undefined;
      this.hoverGemY = undefined;
    });

    this.canvasService.canvas.addEventListener('mousedown', () => {
      if (!this.mouseEvents) { return; }

      this.activeGemX = this.hoverGemX;
      this.activeGemY = this.hoverGemY;
      this.isGemExchange = true;
    });

    this.canvasService.canvas.addEventListener('touchstart', (event) => {
      const gemPosition = this.canvasService.getCanvasGem(event.touches[0].clientX, event.touches[0].clientY)
      this.hoverGemX = gemPosition.x;
      this.hoverGemY = gemPosition.y;

      this.activeGemX = gemPosition.x;
      this.activeGemY = gemPosition.y;

      this.isGemExchange = true;
      this.mouseEvents = false;
    });

    this.canvasService.canvas.addEventListener('touchmove', (event) => {
      const gemPosition = this.canvasService.getCanvasGem(event.touches[0].clientX, event.touches[0].clientY)

      this.hoverGemX = gemPosition.x;
      this.hoverGemY = gemPosition.y;
    });

    this.canvasService.canvas.addEventListener('touchend', () => {
      this.clearGems()
    });

    this.canvasService.canvas.addEventListener('touchcancel', () => {
      this.clearGems()
    });
  }

  clearGems() {
    this.activeGemX = undefined;
    this.activeGemY = undefined;
    this.hoverGemX = undefined;
    this.hoverGemY = undefined;
    this.isGemExchange = false;
  }
}
