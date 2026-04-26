import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { PaymentStatusComponent } from '../../components/payment-status/payment-status.component';
import type { Payment } from '../../models/domain.models';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-payments-page',
  imports: [CommonModule, CurrencyPipe, PaymentStatusComponent],
  templateUrl: './payments.page.html',
  styleUrl: './payments.page.css'
})
export class PaymentsPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly payments = signal<Payment[]>([]);

  ngOnInit() {
    this.load();
  }

  markAs(payment: Payment, status: Payment['status']) {
    this.api
      .upsertPayment({
        paymentId: payment.id,
        chargeId: payment.chargeId,
        userId: payment.userId,
        amount: payment.amount,
        status,
        paidAt: status === 'paid' ? new Date().toISOString() : null
      })
      .subscribe(() => this.load());
  }

  private load() {
    this.api.listPayments('house-bh-centro').subscribe((payments) => this.payments.set(payments));
  }
}
