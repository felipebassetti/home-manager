import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MemberListComponent } from '../../components/member-list/member-list.component';
import { PaymentStatusComponent } from '../../components/payment-status/payment-status.component';
import { SpotlightCardDirective } from '../../directives/spotlight-card.directive';
import type { ApplicationStatus, HouseDetail, Payment } from '../../models/domain.models';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-house-detail-page',
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, MemberListComponent, PaymentStatusComponent, SpotlightCardDirective],
  templateUrl: './house-detail.page.html',
  styleUrl: './house-detail.page.css'
})
export class HouseDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);

  readonly house = signal<HouseDetail | null>(null);
  readonly selectedRoomId = signal<string | null>(null);
  readonly applicationMessage = signal('');
  readonly contactPhone = signal('');
  readonly contactInstagram = signal('');
  readonly applicationError = signal('');
  readonly feedback = signal('');
  readonly selectedImageIndex = signal(0);
  readonly imageViewerOpen = signal(false);
  readonly isSubmittingApplication = signal(false);

  readonly accountType = computed(() => this.auth.activeProfile().accountType);
  readonly isAuthenticated = computed(() => this.auth.isAuthenticated());
  readonly isVisitor = computed(() => this.accountType() === 'visitor');
  readonly canApply = computed(() => this.isAuthenticated() && this.isVisitor());
  readonly isMember = computed(() => this.accountType() === 'member');
  readonly isHouseAdmin = computed(() => this.accountType() === 'house-admin');
  readonly isSuperAdmin = computed(() => this.accountType() === 'super-admin');
  readonly canManageHouse = computed(() => this.isHouseAdmin() || this.isSuperAdmin());
  readonly canSeeFinancials = computed(() => this.isMember() || this.canManageHouse());

  readonly galleryImages = computed(() => {
    const house = this.house();
    if (!house) {
      return [];
    }

    return house.galleryImages?.length ? house.galleryImages : [house.imageUrl];
  });

  readonly visibleRooms = computed(() => {
    const house = this.house();
    if (!house) {
      return [];
    }

    return this.isVisitor() ? house.rooms.filter((room) => room.available) : house.rooms;
  });

  readonly visibleCharges = computed(() => {
    const house = this.house();
    if (!house || !this.canSeeFinancials()) {
      return [];
    }

    return house.charges;
  });

  readonly visiblePayments = computed(() => {
    const house = this.house();
    if (!house || !this.canSeeFinancials()) {
      return [];
    }

    if (this.canManageHouse()) {
      return house.payments;
    }

    const profileId = this.auth.activeProfile().id;
    return house.payments.filter((payment) => payment.userId === profileId);
  });

  readonly managedApplications = computed(() => {
    const house = this.house();
    if (!house || !this.canManageHouse()) {
      return [];
    }

    return house.applications;
  });

  readonly applicationStepLabel = computed(() => {
    if (this.isVisitor()) {
      return 'Aplicacao';
    }

    if (this.canManageHouse()) {
      return 'Gestao';
    }

    return 'Morador';
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const houseId = params.get('id');
      if (!houseId) {
        return;
      }

      this.api.getHouseById(houseId).subscribe((house) => {
        this.house.set(house);
        this.selectedRoomId.set(null);
        this.applicationMessage.set('');
        this.contactPhone.set('');
        this.contactInstagram.set('');
        this.applicationError.set('');
        this.feedback.set('');
        this.selectedImageIndex.set(0);
        this.imageViewerOpen.set(false);
      });
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

  selectImage(index: number) {
    const gallery = this.galleryImages();
    if (!gallery.length) {
      return;
    }

    const normalizedIndex = ((index % gallery.length) + gallery.length) % gallery.length;
    this.selectedImageIndex.set(normalizedIndex);
  }

  openGallery(index = this.selectedImageIndex()) {
    this.selectImage(index);
    this.imageViewerOpen.set(true);
  }

  closeGallery() {
    this.imageViewerOpen.set(false);
  }

  previousImage() {
    this.selectImage(this.selectedImageIndex() - 1);
  }

  nextImage() {
    this.selectImage(this.selectedImageIndex() + 1);
  }

  visiblePaymentCountByStatus(status: Payment['status']) {
    return this.visiblePayments().filter((payment) => payment.status === status).length;
  }

  countApplicationsByStatus(status: ApplicationStatus) {
    return this.managedApplications().filter((application) => application.status === status).length;
  }

  applicationStatusLabel(status: ApplicationStatus) {
    if (status === 'submitted') {
      return 'Enviada';
    }

    if (status === 'in_review') {
      return 'Em analise';
    }

    if (status === 'contact_soon') {
      return 'Vai entrar em contato';
    }

    return 'Rejeitada';
  }

  goToLogin() {
    void this.router.navigate(['/login'], {
      queryParams: {
        redirect: this.router.url
      }
    });
  }

  submitApplication() {
    const house = this.house();
    if (!house || !this.canApply()) {
      return;
    }

    this.applicationError.set('');
    if (!this.contactPhone().trim()) {
      this.applicationError.set('Informe um telefone para contato.');
      return;
    }

    if (this.applicationMessage().trim().length < 12) {
      this.applicationError.set('Escreva uma mensagem um pouco mais completa para o gestor.');
      return;
    }

    this.feedback.set('');
    this.isSubmittingApplication.set(true);
    this.api
      .createApplication({
        houseId: house.id,
        roomId: this.selectedRoomId(),
        userId: this.auth.activeProfile().id,
        message: this.applicationMessage().trim(),
        contactPhone: this.contactPhone().trim(),
        contactInstagram: this.contactInstagram().trim()
      })
      .subscribe(() => {
        this.feedback.set('Candidatura enviada. Agora e so acompanhar o status nesta vaga.');
        this.applicationError.set('');
        this.applicationMessage.set('');
        this.contactPhone.set('');
        this.contactInstagram.set('');
        this.isSubmittingApplication.set(false);
      });
  }

  updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
    this.api.updateApplicationStatus({ applicationId, status }).subscribe((updatedApplication) => {
      if (!updatedApplication) {
        return;
      }

      this.house.update((house) => {
        if (!house) {
          return house;
        }

        return {
          ...house,
          applications: house.applications.map((application) =>
            application.id === updatedApplication.id ? { ...application, ...updatedApplication } : application
          )
        };
      });
    });
  }
}
