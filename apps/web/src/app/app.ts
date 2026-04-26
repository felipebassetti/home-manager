import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly navItems = [
    { href: '/', label: 'Descobrir', shortLabel: 'Inicio' },
    { href: '/houses', label: 'Acomodações', shortLabel: 'Marketplace' },
    { href: '/dashboard', label: 'Hospedagem', shortLabel: 'Dashboard' },
    { href: '/house-manage', label: 'Anunciar', shortLabel: 'Gestao' },
    { href: '/payments', label: 'Financeiro', shortLabel: 'Pagamentos' }
  ];

  constructor(protected readonly auth: AuthService) {}
}
