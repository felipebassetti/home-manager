import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { SpotlightCardDirective } from '../../directives/spotlight-card.directive';
import type { HouseDetail } from '../../models/domain.models';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { paginateItems } from '../../utils/pagination';

@Component({
  selector: 'app-my-houses-page',
  imports: [CommonModule, CurrencyPipe, RouterLink, SpotlightCardDirective, PaginationComponent],
  templateUrl: './my-houses.page.html',
  styleUrl: './my-houses.page.css'
})
export class MyHousesPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);
  private readonly pageSize = 6;

  readonly houses = signal<HouseDetail[]>([]);
  readonly currentPage = signal(1);
  readonly isLoading = signal(true);
  readonly isSeeding = signal(false);
  readonly seedFeedback = signal('');
  readonly seedError = signal('');

  readonly visibleHouses = computed(() => {
    const profile = this.auth.activeProfile();
    if (this.auth.isSiteAdmin(profile)) {
      return this.houses();
    }

    return this.houses().filter((house) => this.auth.managesHouse(house.id, profile));
  });
  readonly paginatedVisibleHouses = computed(() => paginateItems(this.visibleHouses(), this.currentPage(), this.pageSize));

  readonly totalOpenRooms = computed(() => this.visibleHouses().reduce((total, house) => total + house.availableRooms, 0));
  readonly totalApplications = computed(() => this.visibleHouses().reduce((total, house) => total + house.applications.length, 0));
  readonly totalPendingPayments = computed(() =>
    this.visibleHouses().reduce(
      (total, house) => total + house.payments.filter((payment) => payment.status === 'pending' || payment.status === 'overdue').length,
      0
    )
  );

  ngOnInit() {
    this.loadHouses();
  }

  seedDemoHouses() {
    if (this.isSeeding()) {
      return;
    }

    this.isSeeding.set(true);
    this.seedFeedback.set('');
    this.seedError.set('');

    this.api.seedDemoHouses(this.auth.activeProfile().id).subscribe({
      next: async (createdHouses) => {
        await this.auth.refreshAccess();
        this.seedFeedback.set(`${createdHouses.length} casas teste foram criadas para sua conta.`);
        this.currentPage.set(1);
        this.loadHouses();
      },
      error: () => {
        this.seedError.set('Nao foi possivel criar as casas teste agora.');
        this.isSeeding.set(false);
      }
    });
  }

  private loadHouses() {
    this.isLoading.set(true);

    this.api.listHouses().subscribe((houses) => {
      if (!houses.length) {
        this.houses.set([]);
        this.currentPage.set(1);
        this.isLoading.set(false);
        this.isSeeding.set(false);
        return;
      }

      const details: HouseDetail[] = [];
      let remaining = houses.length;

      houses.forEach((house) => {
        this.api.getHouseById(house.id).subscribe((detail) => {
          if (detail) {
            details.push(detail);
          }

          remaining -= 1;
          if (remaining === 0) {
            this.houses.set(details.sort((left, right) => right.createdAt.localeCompare(left.createdAt)));
            this.currentPage.set(1);
            this.isLoading.set(false);
            this.isSeeding.set(false);
          }
        });
      });
    });
  }
}
