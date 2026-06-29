import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, MoreThan } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductView } from './entities/product-view.entity';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { OrderItem } from '../orders/entities/order-item.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductView)
    private readonly productViewRepository: Repository<ProductView>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async findAll(query: ProductQueryDto) {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
    } = query;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true });

    if (search) {
      qb.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }

    if (category) {
      qb.andWhere('product.category = :category', { category });
    }

    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    qb.orderBy(`product.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getCategories(): Promise<string[]> {
    const result = await this.productRepository
      .createQueryBuilder('p')
      .select('DISTINCT p.category', 'category')
      .where('p.isActive = :isActive', { isActive: true })
      .orderBy('category', 'ASC')
      .getRawMany();
    return result.map((r) => r.category);
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findAllAdmin(): Promise<Product[]> {
    return this.productRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOneAdmin(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOneAdmin(id);
    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async softDelete(id: string): Promise<void> {
    const product = await this.findOneAdmin(id);
    product.isActive = false;
    await this.productRepository.save(product);
  }

  async getSuggestions(
    productId: string,
    userId?: string,
  ): Promise<{ data: Product[]; personalised: boolean }> {
    const current = await this.findOne(productId);

    let targetCategory = current.category;
    let personalised = false;

    if (userId) {
      const top = await this.orderItemRepository
        .createQueryBuilder('item')
        .innerJoin('item.order', 'ord', 'ord.userId = :userId', { userId })
        .innerJoin('item.product', 'prod')
        .select('prod.category', 'category')
        .addSelect('SUM(item.quantity)', 'qty')
        .where('item.productId IS NOT NULL')
        .groupBy('prod.category')
        .orderBy('SUM(item.quantity)', 'DESC')
        .limit(1)
        .getRawOne<{ category: string; qty: string }>();

      if (top) {
        targetCategory = top.category;
        personalised = true;
      }
    }

    const suggestions = await this.productRepository.find({
      where: {
        id: Not(productId),
        category: targetCategory,
        isActive: true,
        stock: MoreThan(0),
      },
      order: { createdAt: 'DESC' },
      take: 4,
    });

    return { data: suggestions, personalised };
  }

  async recordView(productId: string, userId: string): Promise<void> {
    const view = this.productViewRepository.create({ productId, userId });
    await this.productViewRepository.save(view);
  }
}
