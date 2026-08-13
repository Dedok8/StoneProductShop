import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

import {
  CreateLeadDto,
  LeadQueryDto,
  PaginatedLeadResponseDto,
} from '@/model/leads/application/dto';
import { LeadMapper } from '@/model/leads/application/mapper';
import { LEAD_REPOSITORY } from '@/model/leads/domain/interfaces';
import { LeadRepository } from '@/model/leads/infrastructure';
import { PaginationMetaDto } from '@/shared';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: LeadRepository,
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
  ) {}

  async findAll(query: LeadQueryDto): Promise<PaginatedLeadResponseDto> {
    const { items, total } = await this.leadRepository.findAll(query);

    return new PaginatedLeadResponseDto({
      items: LeadMapper.toResponseList(items),
      meta: new PaginationMetaDto({
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        total,
      }),
    });
  }

  async create(dto: CreateLeadDto) {
    if (!dto.consent) {
      throw new BadRequestException('Consent is required');
    }

    const lead = await this.leadRepository.create(dto);

    this.mailerService
      .sendMail({
        to: this.config.get('MANAGER_EMAIL'),
        subject: 'New request from the website',
        html: `<p><strong>${lead.name}</strong> — ${lead.phone}</p>`,
      })
      .catch((error) => {
        this.logger.error(`Failed to send email for lead ${lead.id}`, error);
      });

    return LeadMapper.toResponse(lead);
  }
}
