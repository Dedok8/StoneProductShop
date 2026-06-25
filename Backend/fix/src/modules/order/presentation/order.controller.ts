import type { AccessTokenPayload } from '@modules/auth/domain';
import {
  CreateOrderDto,
  OrderQueryDto,
  OrderService,
  UpdateOrderStatusDto,
} from '@modules/order/application';
import { UserRole } from '@modules/user/domain';
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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '@shared/decorators';
import { JwtAuthGuard, RolesGuard } from '@shared/guards';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order from cart items' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: AccessTokenPayload) {
    return this.orderService.create(dto, user.sub);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get current user orders' })
  findMine(
    @Query() query: OrderQueryDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.orderService.findMyOrders(user.sub, query);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all orders (admin only)' })
  findAll(@Query() query: OrderQueryDto) {
    return this.orderService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by id (owner or admin)' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.orderService.findById(id, {
      userId: user.sub,
      role: user.role,
    });
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending order (owner or admin)' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.orderService.cancel(id, { userId: user.sub, role: user.role });
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update order status (admin only)' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, dto.status);
  }
}
