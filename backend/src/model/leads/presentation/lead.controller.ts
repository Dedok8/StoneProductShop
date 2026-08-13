import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { LeadsService } from '@/model/leads/application';
import {
  CreateLeadDto,
  LeadQueryDto,
  LeadResponse,
  PaginatedLeadResponseDto,
} from '@/model/leads/application/dto';
import { JWTAuthGuard, Roles, RolesGuard, UserRole } from '@/shared';

@Controller('lead')
export class LeadController {
  constructor(private readonly leadService: LeadsService) {}

  @Get()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  getAll(@Query() query: LeadQueryDto): Promise<PaginatedLeadResponseDto> {
    return this.leadService.findAll(query);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  create(@Body() dto: CreateLeadDto): Promise<LeadResponse> {
    return this.leadService.create(dto);
  }
}
