import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { SpotlightCardDirective } from '../../directives/spotlight-card.directive';
import type { ApplicationListItem, ApplicationStatus } from '../../models/domain.models';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { paginateItems } from '../../utils/pagination';

type ApplicationFilter = 'all' | ApplicationStatus;

@Component({
  selector: 'app-applications-page',
  imports: [CommonModule, RouterLink, DatePipe, SpotlightCardDirective, PaginationComponent],
  templateUrl: './applications.page.html',
  styleUrl: './applications.page.css'
})
export class ApplicationsPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);
  private readonly pageSize = 6;

  protected readonly activeFilter = signal<ApplicationFilter>('all');
  protected readonly applications = signal<ApplicationListItem[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly searchTerm = signal('');
  protected readonly error = signal('');

  protected readonly filteredApplications = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchTerm().trim().toLowerCase();
    const items = filter === 'all' ? this.applications() : this.applications().filter((item) => item.status === filter);

    if (!query) {
      return items;
    }

    return items.filter((item) =>
      [
        item.houseTitle,
        item.houseCity,
        item.houseNeighborhood,
        item.roomTitle ?? '',
        item.message,
        item.contactPhone,
        item.contactInstagram ?? ''
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  });
  protected readonly paginatedApplications = computed(() => paginateItems(this.filteredApplications(), this.currentPage(), this.pageSize));

  ngOnInit() {
    if (!this.auth.isAuthenticated()) {
      return;
    }

    this.api.listApplicationsByUser(this.auth.activeProfile().id).subscribe({
      next: (applications) => {
        this.applications.set(applications);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar suas candidaturas agora.');
      }
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

  protected setFilter(filter: ApplicationFilter) {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
  }

  protected setSearchTerm(value: string) {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  protected messagePreview(message: string) {
    const trimmed = message.trim();
    if (trimmed.length <= 88) {
      return trimmed;
    }

    return `${trimmed.slice(0, 85)}...`;
  }
}
