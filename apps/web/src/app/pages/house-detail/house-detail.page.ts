import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MemberListComponent } from '../../components/member-list/member-list.component';
import { PaymentStatusComponent } from '../../components/payment-status/payment-status.component';
import type { ApplicationStatus, HouseDetail, Payment } from '../../models/domain.models';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-house-detail-page',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CurrencyPipe, DatePipe, MemberListComponent, PaymentStatusComponent],
  templateUrl: './house-detail.page.html',
  styleUrl: './house-detail.page.css'
})
export class HouseDetailPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
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
  readonly chargeError = signal('');
  readonly chargeFeedback = signal('');
  readonly isSubmittingCharge = signal(false);
  readonly memberError = signal('');
  readonly memberFeedback = signal('');
  readonly isSubmittingMember = signal(false);
  readonly chargeForm = this.fb.group({
    title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(80)]),
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    dueDate: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)])
  });
  readonly memberForm = this.fb.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    role: this.fb.nonNullable.control<'member' | 'admin'>('member')
  });

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

  readonly localMemberSuggestions = computed(() =>
    this.auth.profiles
      .filter((profile) => profile.id !== this.auth.activeProfile().id)
      .map((profile) => ({
        email: profile.email,
        label: `${profile.name} (${profile.email})`
      }))
  );

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
        this.chargeError.set('');
        this.chargeFeedback.set('');
        this.memberError.set('');
        this.memberFeedback.set('');
        this.chargeForm.reset({ title: '', amount: null, dueDate: '' });
        this.memberForm.reset({ email: '', role: 'member' });
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

  chargeFieldError(field: 'title' | 'amount' | 'dueDate') {
    const control = this.chargeForm.controls[field];
    if (!control.touched && !control.dirty) {
      return '';
    }

    if (control.hasError('required')) {
      if (field === 'title') {
        return 'Informe um titulo para a cobranca.';
      }

      if (field === 'amount') {
        return 'Informe um valor maior que zero.';
      }

      return 'Informe a data de vencimento.';
    }

    if (field === 'amount' && control.hasError('min')) {
      return 'Use um valor maior que zero.';
    }

    if (field === 'dueDate' && control.hasError('pattern')) {
      return 'Use uma data valida.';
    }

    if (field === 'title' && control.hasError('maxlength')) {
      return 'Use um titulo mais curto.';
    }

    return '';
  }

  memberFieldError(field: 'email' | 'role') {
    const control = this.memberForm.controls[field];
    if (!control.touched && !control.dirty) {
      return '';
    }

    if (field === 'email' && control.hasError('required')) {
      return 'Informe o email do morador.';
    }

    if (field === 'email' && control.hasError('email')) {
      return 'Use um email valido.';
    }

    return '';
  }

  submitCharge() {
    const house = this.house();
    if (!house || !this.canManageHouse()) {
      return;
    }

    this.chargeError.set('');
    this.chargeFeedback.set('');

    if (this.chargeForm.invalid) {
      this.chargeForm.markAllAsTouched();
      return;
    }

    const value = this.chargeForm.getRawValue();
    const title = value.title.trim();
    const amount = Number(value.amount ?? 0);
    const dueDate = value.dueDate.trim();

    if (!title || !Number.isFinite(amount) || amount <= 0 || Number.isNaN(Date.parse(`${dueDate}T00:00:00`))) {
      this.chargeError.set('Revise titulo, valor e vencimento antes de salvar.');
      return;
    }

    this.isSubmittingCharge.set(true);
    this.api
      .createCharge({
        houseId: house.id,
        title,
        amount,
        dueDate
      })
      .subscribe({
        next: (createdCharge) => {
          this.house.update((currentHouse) => {
            if (!currentHouse) {
              return currentHouse;
            }

            return {
              ...currentHouse,
              charges: [createdCharge, ...currentHouse.charges]
            };
          });
          this.chargeForm.reset({ title: '', amount: null, dueDate: '' });
          this.chargeForm.markAsPristine();
          this.chargeForm.markAsUntouched();
          this.chargeFeedback.set('Cobranca criada e adicionada ao financeiro da casa.');
          this.isSubmittingCharge.set(false);
        },
        error: () => {
          this.chargeError.set('Nao foi possivel criar a cobranca agora.');
          this.isSubmittingCharge.set(false);
        }
      });
  }

  submitMember() {
    const house = this.house();
    if (!house || !this.canManageHouse()) {
      return;
    }

    this.memberError.set('');
    this.memberFeedback.set('');

    if (this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      return;
    }

    const value = this.memberForm.getRawValue();
    const email = value.email.trim().toLowerCase();
    if (!email) {
      this.memberError.set('Informe o email do morador.');
      return;
    }

    this.isSubmittingMember.set(true);
    this.api
      .addMember(house.id, {
        email,
        role: value.role
      })
      .subscribe({
        next: (createdMember) => {
          this.house.update((currentHouse) => {
            if (!currentHouse) {
              return currentHouse;
            }

            return {
              ...currentHouse,
              members: [...currentHouse.members, createdMember]
            };
          });
          this.memberForm.reset({ email: '', role: 'member' });
          this.memberForm.markAsPristine();
          this.memberForm.markAsUntouched();
          this.memberFeedback.set('Morador vinculado a casa com sucesso.');
          this.isSubmittingMember.set(false);
        },
        error: (error: { error?: { error?: string; message?: string } }) => {
          const backendMessage = error.error?.error ?? error.error?.message ?? '';
          this.memberError.set(this.memberErrorMessage(backendMessage));
          this.isSubmittingMember.set(false);
        }
      });
  }

  private memberErrorMessage(message: string) {
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('profile not found')) {
      return 'Nenhum usuario com esse email foi encontrado.';
    }

    if (normalizedMessage.includes('member already exists')) {
      return 'Esse usuario ja esta vinculado a casa.';
    }

    if (normalizedMessage.includes('email must be valid')) {
      return 'Use um email valido.';
    }

    return 'Nao foi possivel adicionar o morador agora.';
  }
}
