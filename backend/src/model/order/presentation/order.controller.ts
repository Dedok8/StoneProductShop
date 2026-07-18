import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import type { IAccessTokenPayload } from '@/model/auth/domain';
import { OrderService } from '@/model/order/application';
import {
  CreateOrderDto,
  OrderQueryDto,
  OrderResponse,
  PaginatedOrderResponseDto,
  UpdateOrderStatusDto,
} from '@/model/order/application/dto';
import {
  CurrentUser,
  JWTAuthGuard,
  Roles,
  RolesGuard,
  UserRole,
} from '@/shared';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser('sub') userId: string,
  ): Promise<OrderResponse> {
    return this.orderService.create(userId, dto);
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  getMyOrders(
    @CurrentUser('sub') userId: string,
    @Query() query: OrderQueryDto,
  ): Promise<PaginatedOrderResponseDto> {
    return this.orderService.findAll({ ...query, userId });
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: IAccessTokenPayload,
  ): Promise<OrderResponse> {
    const ownerId = user.role === UserRole.ADMIN ? undefined : user.sub;
    return this.orderService.findById(id, ownerId);
  }

  @Get()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  getAll(@Query() query: OrderQueryDto): Promise<PaginatedOrderResponseDto> {
    return this.orderService.findAll(query);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponse> {
    return this.orderService.updateStatus(id, dto.status);
  }
}
