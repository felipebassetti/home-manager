import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { PaymentStatusComponent } from '../../components/payment-status/payment-status.component';
import type { Payment } from '../../models/domain.models';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-payments-page',
  imports: [CommonModule, CurrencyPipe, PaymentStatusComponent],
  templateUrl: './payments.page.html',
  styleUrl: './payments.page.css'
})
export class PaymentsPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  readonly payments = signal<Payment[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal('');

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
      .subscribe({
        next: () => this.load(),
        error: () => {
          this.error.set('Nao foi possivel atualizar o pagamento agora.');
        }
      });
  }

  private load() {
    this.error.set('');
    this.isLoading.set(true);
    this.api.listHouses().subscribe({
      next: (houses) => {
        const profile = this.auth.activeProfile();
        const visibleHouseIds =
          profile.accountType === 'super-admin'
            ? houses.map((house) => house.id)
            : houses.filter((house) => house.ownerId === profile.id).map((house) => house.id);

        this.api.listPayments().subscribe({
          next: (payments) => {
            this.payments.set(
              payments.filter((payment) => {
                const houseId = payment.charge?.houseId;
                return Boolean(houseId && visibleHouseIds.includes(houseId));
              })
            );
            this.isLoading.set(false);
          },
          error: () => {
            this.error.set('Nao foi possivel carregar os pagamentos agora.');
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.error.set('Nao foi possivel carregar as casas do gestor.');
        this.isLoading.set(false);
      }
    });
  }
}
