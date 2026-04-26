import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HouseCardComponent } from '../../components/house-card/house-card.component';
import { ApiService } from '../../services/api.service';
import type { HouseSummary } from '../../models/domain.models';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink, HouseCardComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css'
})
export class HomePageComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly houses = signal<HouseSummary[]>([]);

  ngOnInit() {
    this.api.listHouses().subscribe((houses) => this.houses.set(houses.slice(0, 3)));
  }

  totalAvailableRooms() {
    return this.houses().reduce((total, house) => total + house.availableRooms, 0);
  }

  totalCities() {
    return new Set(this.houses().map((house) => house.city)).size;
  }
}
