import { LeadResponse } from '@/model/leads/application/dto';
import type { LeadEntity } from '@/model/leads/domain/entities';

export class LeadMapper {
  static toResponse(entity: LeadEntity): LeadResponse {
    return new LeadResponse({
      id: entity.id,
      name: entity.name,
      phone: entity.phone,
      consent: entity.consent,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toResponseList(entities: LeadEntity[]): LeadResponse[] {
    return entities.map((entity) => LeadMapper.toResponse(entity));
  }
}
