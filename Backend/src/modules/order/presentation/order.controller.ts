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

interface IAuthenticatedUser {
  userId: string;
  role: string;
}

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order from cart items' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: IAuthenticatedUser) {
    return this.orderService.create(dto, user.userId);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get current user orders' })
  findMine(
    @Query() query: OrderQueryDto,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    return this.orderService.findMyOrders(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by id (owner or admin)' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    return this.orderService.findById(id, user);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending order (owner or admin)' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    return this.orderService.cancel(id, user);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all orders (admin only)' })
  findAll(@Query() query: OrderQueryDto) {
    return this.orderService.findAll(query);
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
