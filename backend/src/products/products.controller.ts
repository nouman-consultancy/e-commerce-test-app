import { Controller, Get, Post, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('categories')
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get(':id/suggestions')
  @UseGuards(OptionalJwtAuthGuard)
  getSuggestions(@Param('id') id: string, @CurrentUser() user?: User) {
    return this.productsService.getSuggestions(id, user?.id);
  }

  @Post(':id/view')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  recordView(@Param('id') id: string, @CurrentUser() user: User) {
    return this.productsService.recordView(id, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
