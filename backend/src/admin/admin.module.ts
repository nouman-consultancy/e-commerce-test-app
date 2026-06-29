import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { AdminProductsController } from './admin-products.controller';

@Module({
  imports: [ProductsModule],
  controllers: [AdminProductsController],
})
export class AdminModule {}
