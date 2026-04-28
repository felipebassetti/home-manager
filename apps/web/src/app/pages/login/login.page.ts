import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { isValidEmailInput, normalizeEmailInput, normalizeNameInput } from '../../utils/input-formatters';

type LoginAccountType = 'visitor' | 'house-admin';
type LoginMode = 'login' | 'signup';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css'
})
export class LoginPageComponent {
  private readonly minPasswordLength = 6;
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly roleOptions: Array<{
    value: LoginAccountType;
    label: string;
  }> = [
    {
      value: 'visitor',
      label: 'Candidato'
    },
    {
      value: 'house-admin',
      label: 'Gestor'
    }
  ];

  protected mode = signal<LoginMode>('login');
  protected accountType = signal<LoginAccountType>('visitor');
  protected name = signal('');
  protected email = signal('');
  protected password = signal(this.auth.isSupabaseConfigured ? '' : '123456');
  protected confirmPassword = signal(this.auth.isSupabaseConfigured ? '' : '123456');
  protected acceptedTerms = signal(false);
  protected isSubmitting = signal(false);
  protected errorMessage = signal('');
  protected successMessage = signal('');

  switchMode(mode: LoginMode) {
    this.mode.set(mode);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  async submit() {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSubmitting.set(true);

    if (this.mode() === 'signup' && this.name().trim().length < 3) {
      this.errorMessage.set('Use um nome com pelo menos 3 caracteres.');
      this.isSubmitting.set(false);
      return;
    }

    if (!isValidEmailInput(this.email())) {
      this.errorMessage.set('Use um email valido.');
      this.isSubmitting.set(false);
      return;
    }

    if (this.password().length < this.minPasswordLength) {
      this.errorMessage.set(`Use uma senha com pelo menos ${this.minPasswordLength} caracteres.`);
      this.isSubmitting.set(false);
      return;
    }

    if (this.mode() === 'signup' && this.password() !== this.confirmPassword()) {
      this.errorMessage.set('As senhas nao conferem.');
      this.isSubmitting.set(false);
      return;
    }

    if (this.mode() === 'signup' && !this.acceptedTerms()) {
      this.errorMessage.set('Aceite os termos para criar sua conta.');
      this.isSubmitting.set(false);
      return;
    }

    const result =
      this.mode() === 'signup'
        ? await this.auth.signUpProfile(this.name().trim(), normalizeEmailInput(this.email()), this.password(), this.accountType())
        : await this.auth.signInWithPassword(normalizeEmailInput(this.email()), this.password());
    this.isSubmitting.set(false);

    if ('error' in result && result.error) {
      this.errorMessage.set(result.error.message);
      return;
    }

    if (this.mode() === 'signup' && !this.auth.isAuthenticated()) {
      this.successMessage.set('Conta criada. Confirme seu email e depois faca login para continuar.');
      this.password.set('');
      this.confirmPassword.set('');
      this.acceptedTerms.set(false);
      this.mode.set('login');
      return;
    }

    const defaultRedirectUrl = this.auth.canAccessManagement() ? '/my-houses' : '/applications';
    const redirectUrl = this.route.snapshot.queryParamMap.get('redirect') || defaultRedirectUrl;
    await this.router.navigateByUrl(redirectUrl);
  }

  protected signupTitle() {
    return this.accountType() === 'house-admin' ? 'Criar conta de gestor' : 'Criar conta de candidato';
  }

  protected signupDescription() {
    return this.accountType() === 'house-admin'
      ? 'Cadastre o responsavel pela operacao para publicar casas e acompanhar a rotina da gestao.'
      : 'Cadastre seu perfil para buscar vagas, enviar candidatura e acompanhar o retorno das casas.';
  }

  protected nameLabel() {
    return this.accountType() === 'house-admin' ? 'Nome do responsavel' : 'Nome completo';
  }

  protected namePlaceholder() {
    return this.accountType() === 'house-admin' ? 'Nome de quem vai administrar as casas' : 'Seu nome completo';
  }

  protected submitLabel() {
    if (this.isSubmitting()) {
      return 'Enviando...';
    }

    if (this.mode() === 'signup') {
      return this.accountType() === 'house-admin' ? 'Criar conta de gestor' : 'Criar conta de candidato';
    }

    return 'Entrar';
  }

  protected onNameInput(value: string) {
    this.name.set(normalizeNameInput(value));
  }

  protected onEmailInput(value: string) {
    this.email.set(normalizeEmailInput(value));
  }

  protected nameError() {
    if (this.mode() !== 'signup' || !this.name()) {
      return '';
    }

    return this.name().trim().length < 3 ? 'Use pelo menos 3 caracteres.' : '';
  }

  protected emailError() {
    if (!this.email()) {
      return '';
    }

    return isValidEmailInput(this.email()) ? '' : 'Use um email valido.';
  }

  protected passwordError() {
    if (!this.password()) {
      return '';
    }

    return this.password().length < this.minPasswordLength ? `Minimo de ${this.minPasswordLength} caracteres.` : '';
  }

  protected confirmPasswordError() {
    if (this.mode() !== 'signup' || !this.confirmPassword()) {
      return '';
    }

    return this.password() !== this.confirmPassword() ? 'As senhas precisam ser iguais.' : '';
  }

  protected heroEyebrow() {
    if (this.mode() === 'login') {
      return 'Acesso flatsharing';
    }

    return this.accountType() === 'house-admin' ? 'Para gestores de casas' : 'Para quem busca moradia';
  }

  protected heroTitle() {
    if (this.mode() === 'login') {
      return 'Entre para continuar sua jornada na flatsharing.';
    }

    return this.accountType() === 'house-admin'
      ? 'Encontre roommates alinhados e gerencie sua casa com clareza.'
      : 'Encontre uma moradia que combine com sua rotina, bairro e orcamento.';
  }

  protected heroDescription() {
    if (this.mode() === 'login') {
      return 'Acesse sua conta para acompanhar candidaturas, casas, moradores e pagamentos em um so lugar.';
    }

    return this.accountType() === 'house-admin'
      ? 'Publique quartos, acompanhe interessados, escolha moradores com mais contexto e organize a rotina da casa sem depender de planilhas soltas.'
      : 'Compare casas compartilhadas, veja vagas abertas e envie candidatura com as informacoes que ajudam o gestor a entender seu perfil.';
  }

  protected heroPill() {
    if (this.mode() === 'login') {
      return 'Marketplace e gestao no mesmo sistema';
    }

    return this.accountType() === 'house-admin'
      ? 'Candidaturas, roommates e pagamentos no controle'
      : 'Vagas, bairros e candidaturas em um so lugar';
  }
}
