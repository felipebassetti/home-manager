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
    { href: '/', label: 'Inicio' },
    { href: '/houses', label: 'Marketplace' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/house-manage', label: 'Gestao da casa' },
    { href: '/payments', label: 'Pagamentos' }
  ];

  constructor(protected readonly auth: AuthService) {}
}
