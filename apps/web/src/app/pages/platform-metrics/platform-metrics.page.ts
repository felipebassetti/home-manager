import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { HouseDetail, PaymentStatus } from '../../models/domain.models';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-platform-metrics-page',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './platform-metrics.page.html',
  styleUrl: './platform-metrics.page.css'
})
export class PlatformMetricsPageComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly houses = signal<HouseDetail[]>([]);
  readonly isLoading = signal(true);

  readonly totalRooms = computed(() => this.houses().reduce((total, house) => total + house.rooms.length, 0));
  readonly totalOpenRooms = computed(() => this.houses().reduce((total, house) => total + house.availableRooms, 0));
  readonly totalMembers = computed(() => this.houses().reduce((total, house) => total + house.members.length, 0));
  readonly totalApplications = computed(() => this.houses().reduce((total, house) => total + house.applications.length, 0));
  readonly grossCharges = computed(() =>
    this.houses().reduce((total, house) => total + house.charges.reduce((chargeTotal, charge) => chargeTotal + charge.amount, 0), 0)
  );

  ngOnInit() {
    this.api.listHouses().subscribe((houses) => {
      if (!houses.length) {
        this.houses.set([]);
        this.isLoading.set(false);
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
          }
        });
      });
    });
  }

  paymentsByStatus(status: PaymentStatus) {
    return this.houses().reduce((total, house) => total + house.payments.filter((payment) => payment.status === status).length, 0);
  }

  applicationsInReview() {
    return this.houses().reduce(
      (total, house) => total + house.applications.filter((application) => application.status === 'submitted' || application.status === 'in_review').length,
      0
    );
  }
}
