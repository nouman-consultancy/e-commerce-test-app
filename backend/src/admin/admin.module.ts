import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { Order } from '../orders/entities/order.entity';
import { AdminProductsController } from './admin-products.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), ProductsModule],
  controllers: [AdminProductsController, AdminOrdersController],
  providers: [AdminOrdersService],
})
export class AdminModule {}
