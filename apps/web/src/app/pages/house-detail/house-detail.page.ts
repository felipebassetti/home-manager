import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PaymentStatusComponent } from '../../components/payment-status/payment-status.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import type { HouseDetail } from '../../models/domain.models';

@Component({
  selector: 'app-house-detail-page',
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, PaymentStatusComponent],
  templateUrl: './house-detail.page.html',
  styleUrl: './house-detail.page.css'
})
export class HouseDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);

  readonly house = signal<HouseDetail | null>(null);
  readonly selectedRoomId = signal<string | null>(null);
  readonly applicationMessage = signal('');
  readonly feedback = signal('');

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const houseId = params.get('id');
      if (!houseId) {
        return;
      }

      this.api.getHouseById(houseId).subscribe((house) => this.house.set(house));
    });
  }

  applicationStepState(step: 1 | 2 | 3) {
    if (step === 1) {
      return this.selectedRoomId() ? 'done' : 'active';
    }

    if (step === 2) {
      if (this.feedback()) {
        return 'done';
      }

      return this.applicationMessage().trim().length >= 12 ? 'active' : 'pending';
    }

    return this.feedback() ? 'done' : 'pending';
  }

  submitApplication() {
    const house = this.house();
    if (!house) {
      return;
    }

    this.api
      .createApplication({
        houseId: house.id,
        roomId: this.selectedRoomId(),
        userId: this.auth.activeProfile().id,
        message: this.applicationMessage().trim()
      })
      .subscribe(() => {
        this.feedback.set('Candidatura registrada no modo mock.');
        this.applicationMessage.set('');
      });
  }
}
