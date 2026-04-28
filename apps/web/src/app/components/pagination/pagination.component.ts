import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {
  @Input({ required: true }) totalItems = 0;
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) pageSize = 1;
  @Input() itemLabel = 'itens';
  @Output() pageChange = new EventEmitter<number>();

  get totalPages() {
    return Math.max(1, Math.ceil(this.totalItems / this.safePageSize));
  }

  get currentPageSafe() {
    return Math.min(Math.max(1, this.currentPage || 1), this.totalPages);
  }

  get startItem() {
    if (!this.totalItems) {
      return 0;
    }

    return (this.currentPageSafe - 1) * this.safePageSize + 1;
  }

  get endItem() {
    if (!this.totalItems) {
      return 0;
    }

    return Math.min(this.currentPageSafe * this.safePageSize, this.totalItems);
  }

  get visiblePages(): Array<number | 'ellipsis'> {
    if (this.totalPages <= 7) {
      return Array.from({ length: this.totalPages }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, this.totalPages]);
    const start = Math.max(2, this.currentPageSafe - 1);
    const end = Math.min(this.totalPages - 1, this.currentPageSafe + 1);

    for (let page = start; page <= end; page += 1) {
      pages.add(page);
    }

    const orderedPages = Array.from(pages).sort((left, right) => left - right);
    const result: Array<number | 'ellipsis'> = [];

    orderedPages.forEach((page, index) => {
      const previous = orderedPages[index - 1];
      if (previous && page - previous > 1) {
        result.push('ellipsis');
      }

      result.push(page);
    });

    return result;
  }

  changePage(page: number) {
    const nextPage = Math.min(Math.max(1, page), this.totalPages);
    if (nextPage !== this.currentPageSafe) {
      this.pageChange.emit(nextPage);
    }
  }

  private get safePageSize() {
    return Math.max(1, Math.floor(this.pageSize || 1));
  }
}
