import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MemberListComponent } from '../../components/member-list/member-list.component';
import { PaymentStatusComponent } from '../../components/payment-status/payment-status.component';
import { SpotlightCardDirective } from '../../directives/spotlight-card.directive';
import type { HouseDetail } from '../../models/domain.models';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, RouterLink, CurrencyPipe, MemberListComponent, PaymentStatusComponent, SpotlightCardDirective],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css'
})
export class DashboardPageComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly managedHouses = signal<HouseDetail[]>([]);

  ngOnInit() {
    this.api.listHouses().subscribe((houses) => {
      const details: HouseDetail[] = [];
      let remaining = houses.length;

      houses.forEach((house) => {
        this.api.getHouseById(house.id).subscribe((detail) => {
          if (detail) {
            details.push(detail);
          }

          remaining -= 1;
          if (remaining === 0) {
            this.managedHouses.set(details);
          }
        });
      });
    });
  }

  totalMembers() {
    return this.managedHouses().reduce((total, house) => total + house.members.length, 0);
  }

  totalApplications() {
    return this.managedHouses().reduce((total, house) => total + house.applications.length, 0);
  }

  countPayments(status: 'pending' | 'paid' | 'overdue') {
    return this.managedHouses().reduce(
      (total, house) => total + house.payments.filter((payment) => payment.status === status).length,
      0
    );
  }

  totalRooms() {
    return this.managedHouses().reduce((total, house) => total + house.rooms.length, 0);
  }
}
