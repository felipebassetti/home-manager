import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { curitibaNeighborhoods } from '../../data/curitiba-neighborhoods';
import type { HouseFilters } from '../../models/domain.models';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currency-mask';

@Component({
  selector: 'app-filters',
  imports: [CommonModule, FormsModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent {
  @Output() filtersChange = new EventEmitter<HouseFilters>();
  readonly neighborhoodOptions = curitibaNeighborhoods;

  filters: HouseFilters = {
    city: 'Curitiba',
    neighborhood: '',
    maxPrice: null
  };
  maxPriceInput = '';

  @Input() set initialFilters(value: HouseFilters) {
    this.filters = {
      city: value.city ?? 'Curitiba',
      neighborhood: value.neighborhood ?? '',
      maxPrice: value.maxPrice ?? null
    };
    this.maxPriceInput = formatCurrencyInput(value.maxPrice);
  }

  onPriceInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (!input) {
      return;
    }

    this.maxPriceInput = formatCurrencyInput(input.value);
  }

  submit() {
    this.filtersChange.emit({
      city: this.filters.city?.trim(),
      neighborhood: this.filters.neighborhood?.trim(),
      maxPrice: parseCurrencyInput(this.maxPriceInput)
    });
  }

  reset() {
    this.filters.city = 'Curitiba';
    this.filters.neighborhood = '';
    this.filters.maxPrice = null;
    this.maxPriceInput = '';
    this.submit();
  }
}
