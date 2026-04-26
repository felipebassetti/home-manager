import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FiltersComponent } from '../../components/filters/filters.component';
import { HouseCardComponent } from '../../components/house-card/house-card.component';
import type { HouseFilters, HouseSummary } from '../../models/domain.models';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-houses-page',
  imports: [CommonModule, FiltersComponent, HouseCardComponent],
  templateUrl: './houses.page.html',
  styleUrl: './houses.page.css'
})
export class HousesPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  readonly houses = signal<HouseSummary[]>([]);
  readonly activeFilters = signal<HouseFilters>({ city: 'Curitiba' });

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const neighborhoods = params.getAll('neighborhood').filter(Boolean);

      this.activeFilters.set({
        city: params.get('city') ?? 'Curitiba',
        neighborhood: neighborhoods,
        maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : null
      });

      this.load();
    });
  }

  onFiltersChange(filters: HouseFilters) {
    this.activeFilters.set(filters);
    this.load();
  }

  private load() {
    this.api.listHouses(this.activeFilters()).subscribe((houses) => this.houses.set(houses));
  }
}
