export class PaginationMetaDto {
  page: number;

  limit: number;

  total: number;

  totalPages: number;

  constructor(props: { page: number; limit: number; total: number }) {
    this.page = props.page;
    this.limit = props.limit;
    this.total = props.total;
    this.totalPages = Math.ceil(props.total / props.limit) || 0;
  }
}
