import { Injectable } from '@nestjs/common';
import { PaginationResponse } from './pagination-response';

@Injectable()
export class PaginationService {
    paginate<T>(data: T[], page: number, perPage: number): PaginationResponse<T> {
        const total = data.length;
        const lastPage = Math.ceil(total / perPage) || 1; // Ensure lastPage is at least 1
        const currentPage = Math.min(Math.max(1, page), lastPage);
        const previousPage = currentPage > 1 ? currentPage - 1 : null;
        const nextPage = currentPage < lastPage ? currentPage + 1 : null;
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = Math.min(startIndex + perPage, total);

        const list = data.slice(startIndex, endIndex);

        return {
            status: 'success',
            list,
            total,
            previousPage,
            nextPage,
            lastPage,
            currentPage,
        };
    }
}