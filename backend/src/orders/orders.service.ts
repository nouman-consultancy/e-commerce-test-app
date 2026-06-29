import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly cartService: CartService,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartService.getCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const order = await this.dataSource.transaction(async (manager: EntityManager) => {
      const productIds = cart.items.map((i) => i.productId);

      const products = await manager.find(Product, {
        where: { id: In(productIds) },
        lock: { mode: 'pessimistic_write' },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const item of cart.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new BadRequestException('A product in your cart is no longer available');
        }
        if (item.quantity > product.stock) {
          throw new ConflictException(
            `Only ${product.stock} of '${product.name}' available`,
          );
        }
      }

      let totalAmount = 0;
      const itemsData = cart.items.map((item) => {
        const product = productMap.get(item.productId)!;
        const lineTotal = Number(product.price) * item.quantity;
        totalAmount += lineTotal;
        return {
          productId: product.id,
          productName: product.name,
          productPrice: Number(product.price),
          quantity: item.quantity,
          lineTotal,
        };
      });

      const newOrder = manager.create(Order, {
        userId,
        status: OrderStatus.PENDING,
        totalAmount,
        shippingAddress: dto.shippingAddress ?? null,
        paymentRef: `mock_pay_${randomUUID()}`,
      });
      const savedOrder = await manager.save(Order, newOrder);

      const orderItems = itemsData.map((data) =>
        manager.create(OrderItem, { ...data, orderId: savedOrder.id }),
      );
      await manager.save(OrderItem, orderItems);

      for (const item of cart.items) {
        await manager.decrement(Product, { id: item.productId }, 'stock', item.quantity);
      }

      await manager.delete(CartItem, { cartId: cart.id });

      return manager.findOne(Order, { where: { id: savedOrder.id } }) as Promise<Order>;
    });

    return order;
  }

  async findAll(userId: string): Promise<{ data: Order[]; total: number }> {
    const [data, total] = await this.orderRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async findOne(userId: string, id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Access denied');
    return order;
  }
}
