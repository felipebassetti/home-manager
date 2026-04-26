import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CountUpComponent } from '../../components/count-up/count-up.component';
import { HouseCardComponent } from '../../components/house-card/house-card.component';
import { SpotlightCardDirective } from '../../directives/spotlight-card.directive';
import { curitibaNeighborhoods } from '../../data/curitiba-neighborhoods';
import { ApiService } from '../../services/api.service';
import type { HouseSummary } from '../../models/domain.models';
import { Router } from '@angular/router';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currency-mask';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, FormsModule, RouterLink, CountUpComponent, SpotlightCardDirective, HouseCardComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css'
})
export class HomePageComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly houses = signal<HouseSummary[]>([]);
  readonly neighborhoodOptions = curitibaNeighborhoods;
  searchNeighborhood = '';
  searchMaxPriceInput = '';
  readonly peopleWithHomeTarget = 120;

  ngOnInit() {
    this.api.listHouses().subscribe((houses) => this.houses.set(houses.slice(0, 3)));
  }

  totalAvailableRooms() {
    return this.houses().reduce((total, house) => total + house.availableRooms, 0);
  }

  onPriceInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (!input) {
      return;
    }

    this.searchMaxPriceInput = formatCurrencyInput(input.value);
  }

  search() {
    this.router.navigate(['/houses'], {
      queryParams: {
        city: 'Curitiba',
        neighborhood: this.searchNeighborhood.trim() || null,
        maxPrice: parseCurrencyInput(this.searchMaxPriceInput)
      }
    });
  }
}
