export interface PaginatedItems<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startItem: number;
  endItem: number;
}

const safePageSize = (pageSize: number) => {
  if (!Number.isFinite(pageSize) || pageSize < 1) {
    return 1;
  }

  return Math.floor(pageSize);
};

const totalPagesFor = (totalItems: number, pageSize: number) => Math.max(1, Math.ceil(totalItems / safePageSize(pageSize)));

export const paginateItems = <T>(items: T[], page: number, pageSize: number): PaginatedItems<T> => {
  const totalItems = items.length;
  const normalizedPageSize = safePageSize(pageSize);
  const totalPages = totalPagesFor(totalItems, normalizedPageSize);
  const currentPage = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const startIndex = (currentPage - 1) * normalizedPageSize;
  const endIndex = startIndex + normalizedPageSize;

  return {
    items: items.slice(startIndex, endIndex),
    currentPage,
    totalPages,
    totalItems,
    startItem: totalItems ? startIndex + 1 : 0,
    endItem: totalItems ? Math.min(endIndex, totalItems) : 0
  };
};
