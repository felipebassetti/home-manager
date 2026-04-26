import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SpotlightCardDirective } from '../../directives/spotlight-card.directive';
import type { HouseSummary } from '../../models/domain.models';

@Component({
  selector: 'app-house-card',
  imports: [CommonModule, RouterLink, CurrencyPipe, SpotlightCardDirective],
  templateUrl: './house-card.component.html',
  styleUrl: './house-card.component.css'
})
export class HouseCardComponent {
  @Input({ required: true }) house!: HouseSummary;
}
