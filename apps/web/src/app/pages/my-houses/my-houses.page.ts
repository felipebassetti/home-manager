import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SpotlightCardDirective } from '../../directives/spotlight-card.directive';
import type { HouseDetail } from '../../models/domain.models';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-houses-page',
  imports: [CommonModule, CurrencyPipe, RouterLink, SpotlightCardDirective],
  templateUrl: './my-houses.page.html',
  styleUrl: './my-houses.page.css'
})
export class MyHousesPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);

  readonly houses = signal<HouseDetail[]>([]);
  readonly isLoading = signal(true);
  readonly isSeeding = signal(false);
  readonly seedFeedback = signal('');
  readonly seedError = signal('');

  readonly visibleHouses = computed(() => {
    const profile = this.auth.activeProfile();
    if (profile.accountType === 'super-admin') {
      return this.houses();
    }

    return this.houses().filter((house) => house.ownerId === profile.id);
  });

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
      next: (createdHouses) => {
        this.seedFeedback.set(`${createdHouses.length} casas teste foram criadas para sua conta.`);
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
            this.isLoading.set(false);
            this.isSeeding.set(false);
          }
        });
      });
    });
  }
}
