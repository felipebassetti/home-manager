import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SpotlightCardDirective } from '../../directives/spotlight-card.directive';
import type { ApplicationListItem, ApplicationStatus } from '../../models/domain.models';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

type ApplicationFilter = 'all' | ApplicationStatus;

@Component({
  selector: 'app-applications-page',
  imports: [CommonModule, RouterLink, DatePipe, SpotlightCardDirective],
  templateUrl: './applications.page.html',
  styleUrl: './applications.page.css'
})
export class ApplicationsPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);

  protected readonly activeFilter = signal<ApplicationFilter>('all');
  protected readonly applications = signal<ApplicationListItem[]>([]);

  protected readonly visibleApplications = computed(() => {
    const filter = this.activeFilter();
    const items = this.applications();
    return filter === 'all' ? items : items.filter((item) => item.status === filter);
  });

  ngOnInit() {
    if (!this.auth.isAuthenticated()) {
      return;
    }

    this.api.listApplicationsByUser(this.auth.activeProfile().id).subscribe((applications) => {
      this.applications.set(applications);
    });
  }

  protected filterLabel(filter: ApplicationFilter) {
    if (filter === 'all') {
      return 'Todas';
    }

    return this.statusLabel(filter);
  }

  protected statusLabel(status: ApplicationStatus) {
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
}
