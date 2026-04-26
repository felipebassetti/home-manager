import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appSpotlightCard]',
  standalone: true
})
export class SpotlightCardDirective {
  constructor(private readonly host: ElementRef<HTMLElement>) {}

  @HostListener('pointerenter')
  onPointerEnter() {
    this.host.nativeElement.style.setProperty('--spotlight-opacity', '1');
  }

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {
    const element = this.host.nativeElement;
    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    element.style.setProperty('--spotlight-x', `${x}%`);
    element.style.setProperty('--spotlight-y', `${y}%`);
  }

  @HostListener('pointerleave')
  onPointerLeave() {
    this.host.nativeElement.style.setProperty('--spotlight-opacity', '0');
  }
}
