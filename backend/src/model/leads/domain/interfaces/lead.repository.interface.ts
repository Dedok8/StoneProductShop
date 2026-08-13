import type { LeadStatus } from '@/generated/prisma';
import type { LeadEntity } from '@/model/leads/domain/entities';
import type { SortOrder } from '@/shared';

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
  status?: LeadStatus;
  sortOrder?: SortOrder;
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
