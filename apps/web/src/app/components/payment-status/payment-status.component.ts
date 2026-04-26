import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { PaymentStatus } from '../../models/domain.models';

@Component({
  selector: 'app-payment-status',
  imports: [CommonModule],
  templateUrl: './payment-status.component.html',
  styleUrl: './payment-status.component.css'
})
export class PaymentStatusComponent {
  @Input({ required: true }) status!: PaymentStatus;

  get label() {
    if (this.status === 'paid') {
      return 'Pago';
    }
    if (this.status === 'overdue') {
      return 'Atrasado';
    }
    return 'Pendente';
  }
}
