import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { AdminProductsController } from './admin-products.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User]), ProductsModule],
  controllers: [AdminProductsController, AdminOrdersController, AdminDashboardController],
  providers: [AdminOrdersService, AdminDashboardService],
})
export class AdminModule {}
