import { CanvasService } from './canvas-service';

type EventMethods = {
  handleMouseMove: (event: MouseEvent) => void,
  handleMouseOut: (event: MouseEvent) => void,
  handleMouseDown: (event: MouseEvent) => void,
  handleTouchMove: (event: TouchEvent) => void,
  handleTouchStart: (event: TouchEvent) => void,
  handleTouchEnd: (event: TouchEvent) => void
}

export class InputService {
  canvasService: CanvasService
  mouseEvents: boolean
  isGemExchange: boolean

  hoverGemX: number | undefined
  hoverGemY: number | undefined
  activeGemX: number | undefined
  activeGemY: number | undefined
  eventMethods: EventMethods

  constructor(canvasService: CanvasService) {
    this.canvasService = canvasService
    this.mouseEvents = true
    this.isGemExchange = false

    this.hoverGemX = undefined
    this.hoverGemY = undefined
    this.activeGemX = undefined
    this.activeGemY = undefined

    this.eventMethods = {
      handleMouseMove: this.handleMouseMove.bind(this),
      handleMouseOut: this.handleMouseOut.bind(this),
      handleMouseDown: this.handleMouseDown.bind(this),
      handleTouchMove: this.handleTouchMove.bind(this),
      handleTouchStart: this.handleTouchStart.bind(this),
      handleTouchEnd: this.handleTouchEnd.bind(this)
    }

    this.canvasService.canvas.addEventListener('mousemove', this.eventMethods.handleMouseMove);
    this.canvasService.canvas.addEventListener('mouseout', this.eventMethods.handleMouseOut);
    this.canvasService.canvas.addEventListener('mousedown', this.eventMethods.handleMouseDown);
    this.canvasService.canvas.addEventListener('touchmove', this.eventMethods.handleTouchMove);
    this.canvasService.canvas.addEventListener('touchstart', this.eventMethods.handleTouchStart);
    this.canvasService.canvas.addEventListener('touchend', this.eventMethods.handleTouchEnd);
  }

  clearGems() {
    this.activeGemX = undefined;
    this.activeGemY = undefined;
    this.hoverGemX = undefined;
    this.hoverGemY = undefined;
    this.isGemExchange = false;
  }

  destroy() {
    this.canvasService.canvas.removeEventListener('mousemove', this.eventMethods.handleMouseMove);
    this.canvasService.canvas.removeEventListener('mouseout', this.eventMethods.handleMouseOut);
    this.canvasService.canvas.removeEventListener('mousedown', this.eventMethods.handleMouseDown);
    this.canvasService.canvas.removeEventListener('touchmove', this.eventMethods.handleTouchMove);
    this.canvasService.canvas.removeEventListener('touchstart', this.eventMethods.handleTouchStart);
    this.canvasService.canvas.removeEventListener('touchend', this.eventMethods.handleTouchEnd);
  }

  private handleMouseMove(event: MouseEvent) : void {
    if (!this.mouseEvents) { return; }

    const gemPosition = this.canvasService.getCanvasGem(event.clientX, event.clientY)
    this.hoverGemX = gemPosition.x
    this.hoverGemY = gemPosition.y
  }

  private handleMouseOut() : void {
    if (!this.mouseEvents) { return; }

    this.hoverGemX = undefined;
    this.hoverGemY = undefined;
  }

  private handleMouseDown() : void {
    if (!this.mouseEvents) { return; }

    this.activeGemX = this.hoverGemX;
    this.activeGemY = this.hoverGemY;
    this.isGemExchange = true;
  }

  private handleTouchStart(event: TouchEvent) : void {
    const gemPosition = this.canvasService.getCanvasGem(event.touches[0].clientX, event.touches[0].clientY)
    this.hoverGemX = gemPosition.x;
    this.hoverGemY = gemPosition.y;

    this.activeGemX = gemPosition.x;
    this.activeGemY = gemPosition.y;

    this.isGemExchange = true;
    this.mouseEvents = false;
  }

  private handleTouchMove(event: TouchEvent) : void {
    const gemPosition = this.canvasService.getCanvasGem(event.touches[0].clientX, event.touches[0].clientY)

    this.hoverGemX = gemPosition.x;
    this.hoverGemY = gemPosition.y;
  }

  private handleTouchEnd() : void {
    this.clearGems()
  }

  private handleTouchCancel() : void {
    this.clearGems()
  }
}
