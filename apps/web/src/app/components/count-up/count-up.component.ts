import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, signal } from '@angular/core';

@Component({
  selector: 'app-count-up',
  imports: [CommonModule],
  templateUrl: './count-up.component.html',
  styleUrl: './count-up.component.css'
})
export class CountUpComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) value = 0;
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() duration = 1200;

  readonly displayValue = signal(0);

  private frameId: number | null = null;

  ngOnChanges() {
    this.animate();
  }

  ngOnDestroy() {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  private animate() {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }

    const startValue = this.displayValue();
    const targetValue = Math.max(0, Math.floor(this.value));

    if (startValue === targetValue) {
      return;
    }

    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / this.duration, 1);
      const nextValue = Math.round(startValue + (targetValue - startValue) * progress);
      this.displayValue.set(nextValue);

      if (progress < 1) {
        this.frameId = requestAnimationFrame(step);
      } else {
        this.frameId = null;
      }
    };

    this.frameId = requestAnimationFrame(step);
  }
}
