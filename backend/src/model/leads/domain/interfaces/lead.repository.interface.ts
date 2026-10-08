import type { LEAD_STATUS, SORT_ORDER } from '@stone-shop/shared';

import type { LeadEntity } from '@/model/leads/domain/entities';

export interface ICreateLeadData {
  name: string;
  phone: string;
  consent: boolean;
}

export interface ILeadFindResult {
  items: LeadEntity[];
  total: number;
}

export interface ILeadQuery {
  status?: LEAD_STATUS;
  sortOrder?: SORT_ORDER;
  page?: number;
  limit?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ILeadRepository {
  findAll(query: ILeadQuery): Promise<ILeadFindResult>;
  create(data: ICreateLeadData): Promise<LeadEntity>;
}

export const LEAD_REPOSITORY = Symbol('LEAD_REPOSITORY');
