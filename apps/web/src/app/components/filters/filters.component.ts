import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
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
  @ViewChild('neighborhoodMenu') neighborhoodMenu?: ElementRef<HTMLDivElement>;
  readonly neighborhoodOptions = curitibaNeighborhoods;

  filters: HouseFilters = {
    city: 'Curitiba',
    neighborhood: [],
    maxPrice: null
  };
  maxPriceInput = '';
  isNeighborhoodMenuOpen = false;

  @Input() set initialFilters(value: HouseFilters) {
    this.filters = {
      city: value.city ?? 'Curitiba',
      neighborhood: value.neighborhood ?? [],
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
      neighborhood: this.filters.neighborhood?.length ? this.filters.neighborhood : [],
      maxPrice: parseCurrencyInput(this.maxPriceInput)
    });
  }

  reset() {
    this.filters.city = 'Curitiba';
    this.filters.neighborhood = [];
    this.filters.maxPrice = null;
    this.maxPriceInput = '';
    this.submit();
  }

  toggleNeighborhoodMenu() {
    this.isNeighborhoodMenuOpen = !this.isNeighborhoodMenuOpen;
  }

  toggleNeighborhood(neighborhood: string) {
    if (this.filters.neighborhood?.includes(neighborhood)) {
      this.filters.neighborhood = this.filters.neighborhood.filter((item) => item !== neighborhood);
      return;
    }

    this.filters.neighborhood = [...(this.filters.neighborhood ?? []), neighborhood];
  }

  clearNeighborhoods() {
    this.filters.neighborhood = [];
  }

  selectedNeighborhoodsLabel() {
    if (!this.filters.neighborhood?.length) {
      return 'Todos os bairros';
    }

    if (this.filters.neighborhood.length === 1) {
      return this.filters.neighborhood[0];
    }

    return `${this.filters.neighborhood.length} bairros selecionados`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node | null;
    if (!target || !this.neighborhoodMenu?.nativeElement.contains(target)) {
      this.isNeighborhoodMenuOpen = false;
    }
  }
}
