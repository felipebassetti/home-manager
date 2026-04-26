import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import type { ActiveProfile } from './models/domain.models';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly marketplaceNavItems = [
    { href: '/', label: 'Inicio' },
    { href: '/houses', label: 'Marketplace' }
  ];

  private readonly managementRoutes = ['/dashboard', '/house-manage', '/payments'];
  private readonly router = inject(Router);

  constructor(protected readonly auth: AuthService) {}

  protected isAdmin() {
    return this.auth.activeProfile().accountType === 'admin';
  }

  protected isManagementRoute() {
    return this.managementRoutes.some((route) => this.router.url.startsWith(route));
  }

  protected isHomeRoute() {
    return this.router.url === '/';
  }

  protected profileInitials(profile: ActiveProfile = this.auth.activeProfile()) {
    const parts = profile.name.split(' ').filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
  }

  protected profileRoleLabel(accountType: ActiveProfile['accountType']) {
    if (accountType === 'admin') {
      return 'Gestor da casa';
    }

    if (accountType === 'member') {
      return 'Morador';
    }

    return 'Visitante';
  }

  protected sectionLabel() {
    return this.isManagementRoute() ? 'Area de gestao' : 'Marketplace';
  }

  protected sectionDescription() {
    if (this.isManagementRoute()) {
      return this.isAdmin()
        ? 'Funcoes administrativas liberadas para o gestor da casa.'
        : 'Esta area concentra operacao, cobrancas e administracao.';
    }

    return 'Busca, comparacao e candidatura para vagas em casas compartilhadas.';
  }
}
