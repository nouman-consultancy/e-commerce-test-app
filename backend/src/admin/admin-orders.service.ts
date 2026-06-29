import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { AdminOrdersQueryDto } from './dto/admin-orders-query.dto';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class AdminOrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(query: AdminOrdersQueryDto): Promise<{ data: Order[]; total: number }> {
    const { status, page = 1, limit = 50 } = query;

    const [data, total] = await this.orderRepository.findAndCount({
      where: status ? { status } : {},
      relations: { user: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, newStatus: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);

    const valid = VALID_TRANSITIONS[order.status];
    if (!valid.includes(newStatus)) {
      throw new BadRequestException(
        valid.length
          ? `Cannot transition from '${order.status}' to '${newStatus}'. Valid: ${valid.join(', ')}`
          : `Order is in terminal state '${order.status}' and cannot be updated`,
      );
    }

    order.status = newStatus;
    return this.orderRepository.save(order);
  }
}
