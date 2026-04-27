import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type LoginAccountType = 'visitor' | 'house-admin';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css'
})
export class LoginPageComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly roleOptions: Array<{
    value: LoginAccountType;
    label: string;
    description: string;
  }> = [
    {
      value: 'visitor',
      label: 'Candidato',
      description: 'Buscar vagas, enviar candidatura e acompanhar retorno.'
    },
    {
      value: 'house-admin',
      label: 'Gestor',
      description: 'Publicar casas, acompanhar candidaturas e gerir operacao.'
    }
  ];

  protected mode = signal<'login' | 'signup'>('login');
  protected accountType = signal<LoginAccountType>('visitor');
  protected name = signal('');
  protected email = signal('');
  protected password = signal('123456');
  protected isSubmitting = signal(false);
  protected errorMessage = signal('');

  switchMode(mode: 'login' | 'signup') {
    this.mode.set(mode);
    this.errorMessage.set('');
  }

  async submit() {
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    const result =
      this.mode() === 'signup'
        ? await this.auth.signUpProfile(this.name().trim(), this.email().trim(), this.password(), this.accountType())
        : await this.auth.signInWithPassword(this.email().trim(), this.password(), this.accountType());
    this.isSubmitting.set(false);

    if ('error' in result && result.error) {
      this.errorMessage.set(result.error.message);
      return;
    }

    const defaultRedirectUrl = this.auth.canAccessManagement() ? '/my-houses' : '/applications';
    const redirectUrl = this.route.snapshot.queryParamMap.get('redirect') || defaultRedirectUrl;
    await this.router.navigateByUrl(redirectUrl);
  }
}
