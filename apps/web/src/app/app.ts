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
    { href: '/', label: 'Visao geral', description: 'Resumo e proximas acoes' },
    { href: '/houses', label: 'Marketplace', description: 'Busca de casas e vagas' },
    { href: '/dashboard', label: 'Dashboard', description: 'Operacao da casa' },
    { href: '/house-manage', label: 'Gestao da casa', description: 'Cadastro e configuracao' },
    { href: '/payments', label: 'Pagamentos', description: 'Cobrancas e status' }
  ];

  constructor(protected readonly auth: AuthService) {}
}
