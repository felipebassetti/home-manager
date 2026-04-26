import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HouseCardComponent } from '../../components/house-card/house-card.component';
import { ApiService } from '../../services/api.service';
import type { HouseSummary } from '../../models/domain.models';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink, HouseCardComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css'
})
export class HomePageComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly houses = signal<HouseSummary[]>([]);
  readonly localLoopItems = [
    'Centro',
    'Batel',
    'Reboucas',
    'UFPR',
    'PUCPR',
    'UTFPR',
    'Shopping Estacao',
    'Jardim Botanico'
  ];
  readonly bentoCards = [
    {
      eyebrow: 'Marketplace',
      title: 'Busca direta por bairro',
      description: 'Comece por Curitiba e compare vagas com filtros simples, sem desviar para fluxos de gestao.',
      tone: 'primary'
    },
    {
      eyebrow: 'Gestao',
      title: 'Operacao da casa no mesmo sistema',
      description: 'Moradores, cobrancas e pagamentos ficam agrupados em uma area separada para o gestor.',
      tone: 'secondary'
    },
    {
      eyebrow: 'Financeiro',
      title: 'Cobranca clara por morador',
      description: 'Status de pagamento e vencimento aparecem cedo, sem depender de integracao externa no MVP.',
      tone: 'muted'
    },
    {
      eyebrow: 'Cidade foco',
      title: 'Curitiba primeiro',
      description: 'Produto, filtros e dados mockados foram ajustados para validar o fluxo local antes de expandir.',
      tone: 'soft'
    }
  ];

  ngOnInit() {
    this.api.listHouses().subscribe((houses) => this.houses.set(houses.slice(0, 3)));
  }
}
