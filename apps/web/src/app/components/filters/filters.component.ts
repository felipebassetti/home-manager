import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { HouseFilters } from '../../models/domain.models';

@Component({
  selector: 'app-filters',
  imports: [CommonModule, FormsModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent {
  @Output() filtersChange = new EventEmitter<HouseFilters>();

  readonly filters: HouseFilters = {
    city: '',
    neighborhood: '',
    maxPrice: null
  };

  submit() {
    this.filtersChange.emit({
      city: this.filters.city?.trim(),
      neighborhood: this.filters.neighborhood?.trim(),
      maxPrice: this.filters.maxPrice ? Number(this.filters.maxPrice) : null
    });
  }

  reset() {
    this.filters.city = '';
    this.filters.neighborhood = '';
    this.filters.maxPrice = null;
    this.submit();
  }
}
