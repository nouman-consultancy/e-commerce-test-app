import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductView } from './entities/product-view.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockQb = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockProductRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQb),
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockProductRepo.createQueryBuilder.mockReturnValue(mockQb);
    // Re-attach mockReturnThis after clearAllMocks
    mockQb.where.mockReturnValue(mockQb);
    mockQb.andWhere.mockReturnValue(mockQb);
    mockQb.orderBy.mockReturnValue(mockQb);
    mockQb.skip.mockReturnValue(mockQb);
    mockQb.take.mockReturnValue(mockQb);
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
        { provide: getRepositoryToken(ProductView), useValue: {} },
        { provide: getRepositoryToken(OrderItem), useValue: {} },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findAll()', () => {
    it('applies minPrice filter when provided', async () => {
      await service.findAll({ minPrice: 50 } as never);

      expect(mockQb.andWhere).toHaveBeenCalledWith('product.price >= :minPrice', {
        minPrice: 50,
      });
    });

    it('skips the correct number of records for page 2 with limit 2', async () => {
      await service.findAll({ page: 2, limit: 2 } as never);

      expect(mockQb.skip).toHaveBeenCalledWith(2);
      expect(mockQb.take).toHaveBeenCalledWith(2);
    });
  });
});
