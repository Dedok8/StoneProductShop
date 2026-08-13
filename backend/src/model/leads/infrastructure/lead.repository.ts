import { Injectable } from '@nestjs/common';

import { Prisma } from '@/generated/prisma';
import { LeadEntity } from '@/model/leads/domain/entities';
import {
  ICreateLeadData,
  ILeadFindResult,
  ILeadQuery,
  ILeadRepository,
} from '@/model/leads/domain/interfaces';
import { mapToEntity, PrismaService } from '@/shared';

@Injectable()
export class LeadRepository implements ILeadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ILeadQuery): Promise<ILeadFindResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.LeadWhereInput = {
      status: query.status ?? undefined,

      createdAt:
        query.dateFrom || query.dateTo
          ? {
              gte: query.dateFrom ?? undefined,
              lte: query.dateTo ?? undefined,
            }
          : undefined,
    };

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        orderBy: { createdAt: query.sortOrder ?? 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),

      this.prisma.lead.count({ where }),
    ]);

    return {
      items: leads.map((lead) => mapToEntity(lead, LeadEntity)),
      total,
    };
  }

  async create(data: ICreateLeadData): Promise<LeadEntity> {
    const lead = await this.prisma.lead.create({
      data: { ...data, status: 'NEW' },
    });
    return mapToEntity(lead, LeadEntity);
  }
}
