import { CanvasService } from './canvas-service';
import { Gem } from './types'

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

  hoverGem: Gem | undefined
  activeGem: Gem | undefined
  eventMethods: EventMethods

  constructor(canvasService: CanvasService) {
    this.canvasService = canvasService
    this.mouseEvents = true
    this.isGemExchange = false

    this.hoverGem = undefined;
    this.activeGem = undefined;

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

  clearGems(): void {
    this.hoverGem = undefined;
    this.activeGem = undefined;
    this.isGemExchange = false;
  }

  destroy(): void {
    this.canvasService.canvas.removeEventListener('mousemove', this.eventMethods.handleMouseMove);
    this.canvasService.canvas.removeEventListener('mouseout', this.eventMethods.handleMouseOut);
    this.canvasService.canvas.removeEventListener('mousedown', this.eventMethods.handleMouseDown);
    this.canvasService.canvas.removeEventListener('touchmove', this.eventMethods.handleTouchMove);
    this.canvasService.canvas.removeEventListener('touchstart', this.eventMethods.handleTouchStart);
    this.canvasService.canvas.removeEventListener('touchend', this.eventMethods.handleTouchEnd);
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.mouseEvents) { return; }

    this.hoverGem = this.canvasService.getCanvasGem(event.clientX, event.clientY)
  }

  private handleMouseOut(): void {
    if (!this.mouseEvents) { return; }

    this.hoverGem = undefined;
  }

  private handleMouseDown(): void {
    if (!this.mouseEvents) { return; }

    this.activeGem = this.hoverGem;
    this.isGemExchange = true;
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault()

    this.hoverGem = this.canvasService.getCanvasGem(event.touches[0].clientX, event.touches[0].clientY);
    this.activeGem = this.hoverGem;

    this.isGemExchange = true;
    this.mouseEvents = false;
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault()

    this.hoverGem = this.canvasService.getCanvasGem(event.touches[0].clientX, event.touches[0].clientY)
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault()

    this.clearGems()
  }

  private handleTouchCancel(event: TouchEvent): void {
    event.preventDefault()

    this.clearGems()
  }
}
