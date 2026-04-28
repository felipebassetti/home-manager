import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MemberListComponent } from '../../components/member-list/member-list.component';
import { SpotlightCardDirective } from '../../directives/spotlight-card.directive';
import type { HouseDetail } from '../../models/domain.models';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, RouterLink, MemberListComponent, SpotlightCardDirective],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css'
})
export class DashboardPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

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
            const profile = this.auth.activeProfile();
            this.managedHouses.set(
              profile.accountType === 'super-admin' ? details : details.filter((detail) => detail.ownerId === profile.id)
            );
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
