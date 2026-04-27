import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import type { ActiveProfile } from './models/domain.models';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements AfterViewInit, OnDestroy {
  @ViewChild('topbarRef') private topbarRef?: ElementRef<HTMLElement>;

  private readonly baseNavItems = [
    { href: '/', label: 'Inicio' },
    { href: '/houses', label: 'Marketplace' }
  ];
  protected readonly logoSrc = 'assets/images/logo.png';
  protected readonly logoFallback = signal(false);
  protected readonly topbarHeight = signal(108);

  private readonly managementRoutes = ['/dashboard', '/house-manage', '/payments'];
  private readonly router = inject(Router);
  private resizeObserver?: ResizeObserver;

  constructor(protected readonly auth: AuthService) {}

  ngAfterViewInit() {
    const element = this.topbarRef?.nativeElement;
    if (!element) {
      return;
    }

    const syncHeight = () => {
      this.topbarHeight.set(Math.ceil(element.getBoundingClientRect().height));
    };

    syncHeight();
    this.resizeObserver = new ResizeObserver(syncHeight);
    this.resizeObserver.observe(element);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  protected navItems() {
    return this.auth.canTrackApplications()
      ? [...this.baseNavItems, { href: '/applications', label: 'Candidaturas' }]
      : this.baseNavItems;
  }

  protected isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  protected canAccessManagement() {
    return this.auth.canAccessManagement();
  }

  protected isManagementRoute() {
    return this.managementRoutes.some((route) => this.router.url.startsWith(route));
  }

  protected isHomeRoute() {
    return this.router.url === '/';
  }

  protected async signOut() {
    await this.auth.signOut();
    await this.router.navigateByUrl('/');
  }

  protected profileInitials(profile: ActiveProfile = this.auth.activeProfile()) {
    const parts = profile.name.split(' ').filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
  }

  protected profileRoleLabel(accountType: ActiveProfile['accountType']) {
    return this.auth.profileRoleLabel(accountType);
  }

  protected sectionLabel() {
    if (this.isManagementRoute()) {
      return this.auth.activeProfile().accountType === 'super-admin' ? 'Area global' : 'Area de gestao';
    }

    if (this.router.url.startsWith('/applications')) {
      return 'Candidaturas';
    }

    if (this.router.url.startsWith('/login')) {
      return 'Login';
    }

    return 'Marketplace';
  }

  protected sectionDescription() {
    if (this.isManagementRoute()) {
      return this.auth.activeProfile().accountType === 'super-admin'
        ? 'Visao consolidada de casas, cobranca e operacao em multiplos imoveis.'
        : 'Funcoes administrativas liberadas para o gestor da casa.';
    }

    if (this.router.url.startsWith('/applications')) {
      return 'Status simples para acompanhar retorno das casas e esperar contato do gestor.';
    }

    if (this.router.url.startsWith('/login')) {
      return 'Entre com email e senha para enviar candidatura e acompanhar seu andamento.';
    }

    return 'Busca, comparacao e candidatura para vagas em casas compartilhadas.';
  }
}
