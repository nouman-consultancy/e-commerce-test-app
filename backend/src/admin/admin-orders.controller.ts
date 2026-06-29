import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AdminOrdersService } from './admin-orders.service';
import { AdminOrdersQueryDto } from './dto/admin-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('Admin Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  findAll(@Query() query: AdminOrdersQueryDto) {
    return this.adminOrdersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminOrdersService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.adminOrdersService.updateStatus(id, dto.status);
  }
}
