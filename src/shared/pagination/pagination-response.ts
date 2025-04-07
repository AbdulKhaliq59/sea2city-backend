import { ApiProperty } from "@nestjs/swagger";

export class PaginationResponse<T> {
    @ApiProperty({ description: 'Status of the response', example: 'success' })
    status: string;

    @ApiProperty({ description: 'List of data' })
    list: T[];

    @ApiProperty({ description: 'Total number of records' })
    total: number;

    @ApiProperty({ description: 'Previous page number', required: false })
    previousPage?: number | null;

    @ApiProperty({ description: 'Next page number', required: false })
    nextPage?: number | null;

    @ApiProperty({ description: 'Last page number' })
    lastPage: number;

    @ApiProperty({ description: 'Current page number' })
    currentPage: number;
}