import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { CartService } from '../cart/cart.service';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockProduct = { id: 'prod-1', name: 'Widget', price: 49.99, stock: 10 };
  const mockCartItem = { productId: 'prod-1', quantity: 2, cartId: 'cart-1' };
  const mockCart = { id: 'cart-1', userId: 'user-1', items: [mockCartItem] };
  const savedOrderId = 'order-1';

  const mockManager = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    decrement: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  const mockOrderRepo = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockCartService = {
    getCart: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockDataSource.transaction.mockImplementation((cb: (m: typeof mockManager) => Promise<Order>) =>
      cb(mockManager),
    );
    mockCartService.getCart.mockResolvedValue(mockCart);
    mockManager.find.mockResolvedValue([mockProduct]);
    mockManager.create.mockImplementation(
      (_entity: unknown, data: Record<string, unknown>) => ({ ...data }),
    );
    mockManager.save
      .mockResolvedValueOnce({ id: savedOrderId })
      .mockResolvedValue([]);
    mockManager.decrement.mockResolvedValue(undefined);
    mockManager.delete.mockResolvedValue(undefined);
    mockManager.findOne.mockResolvedValue({
      id: savedOrderId,
      status: OrderStatus.PENDING,
      items: [],
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getDataSourceToken(), useValue: mockDataSource },
        { provide: CartService, useValue: mockCartService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('createOrder()', () => {
    it('throws ConflictException when quantity exceeds product stock', async () => {
      const lowStockProduct = { ...mockProduct, stock: 1 };
      const overQtyCart = { ...mockCart, items: [{ ...mockCartItem, quantity: 5 }] };
      mockCartService.getCart.mockResolvedValue(overQtyCart);
      mockManager.find.mockResolvedValue([lowStockProduct]);

      await expect(service.createOrder('user-1', {})).rejects.toThrow(ConflictException);
    });

    it('snapshots productPrice from product.price at the time of checkout', async () => {
      await service.createOrder('user-1', {});

      const orderItemCreateCall = mockManager.create.mock.calls.find(
        ([entity]: [unknown]) => entity === OrderItem,
      );
      expect(orderItemCreateCall).toBeDefined();
      const itemData = orderItemCreateCall[1] as { productPrice: number };
      expect(itemData.productPrice).toBe(Number(mockProduct.price));
    });

    it('decrements product stock by the ordered quantity', async () => {
      await service.createOrder('user-1', {});

      expect(mockManager.decrement).toHaveBeenCalledWith(
        Product,
        { id: mockProduct.id },
        'stock',
        mockCartItem.quantity,
      );
    });
  });
});
