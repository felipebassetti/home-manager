import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HouseCardComponent } from '../../components/house-card/house-card.component';
import { curitibaNeighborhoods } from '../../data/curitiba-neighborhoods';
import { ApiService } from '../../services/api.service';
import type { HouseSummary } from '../../models/domain.models';
import { Router } from '@angular/router';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currency-mask';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, FormsModule, RouterLink, HouseCardComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css'
})
export class HomePageComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  @ViewChild('neighborhoodMenu') neighborhoodMenu?: ElementRef<HTMLDivElement>;

  readonly houses = signal<HouseSummary[]>([]);
  readonly neighborhoodOptions = curitibaNeighborhoods;
  searchNeighborhoods: string[] = [];
  searchMaxPriceInput = '';
  isNeighborhoodMenuOpen = false;

  ngOnInit() {
    this.api.listHouses().subscribe((houses) => this.houses.set(houses.slice(0, 4)));
  }

  onPriceInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (!input) {
      return;
    }

    this.searchMaxPriceInput = formatCurrencyInput(input.value);
  }

  toggleNeighborhoodMenu() {
    this.isNeighborhoodMenuOpen = !this.isNeighborhoodMenuOpen;
  }

  toggleNeighborhood(neighborhood: string) {
    if (this.searchNeighborhoods.includes(neighborhood)) {
      this.searchNeighborhoods = this.searchNeighborhoods.filter((item) => item !== neighborhood);
      return;
    }

    this.searchNeighborhoods = [...this.searchNeighborhoods, neighborhood];
  }

  clearNeighborhoods() {
    this.searchNeighborhoods = [];
  }

  selectedNeighborhoodsLabel() {
    if (!this.searchNeighborhoods.length) {
      return 'Todos os bairros';
    }

    if (this.searchNeighborhoods.length === 1) {
      return this.searchNeighborhoods[0];
    }

    return `${this.searchNeighborhoods.length} bairros selecionados`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node | null;
    if (!target || !this.neighborhoodMenu?.nativeElement.contains(target)) {
      this.isNeighborhoodMenuOpen = false;
    }
  }

  search() {
    this.router.navigate(['/houses'], {
      queryParams: {
        city: 'Curitiba',
        neighborhood: this.searchNeighborhoods.length ? this.searchNeighborhoods : null,
        maxPrice: parseCurrencyInput(this.searchMaxPriceInput)
      }
    });
  }
}
