import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MemberListComponent } from '../../components/member-list/member-list.component';
import { PaymentStatusComponent } from '../../components/payment-status/payment-status.component';
import type { HouseDetail } from '../../models/domain.models';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, CurrencyPipe, DatePipe, MemberListComponent, PaymentStatusComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css'
})
export class DashboardPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly house = signal<HouseDetail | null>(null);

  ngOnInit() {
    this.api.getHouseById('house-bh-centro').subscribe((house) => this.house.set(house));
  }

  countPayments(status: 'pending' | 'paid' | 'overdue') {
    return this.house()?.payments.filter((payment) => payment.status === status).length ?? 0;
  }
}
