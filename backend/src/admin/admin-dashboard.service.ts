import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getStats() {
    const [totalOrders, totalCustomers, rawSales, rawByStatus, rawTopProducts] =
      await Promise.all([
        this.orderRepository.count(),

        this.userRepository.count({ where: { role: UserRole.CUSTOMER } }),

        this.orderRepository
          .createQueryBuilder('order')
          .select('COALESCE(SUM(order.totalAmount), 0)', 'totalSales')
          .where('order.status != :status', { status: OrderStatus.CANCELLED })
          .getRawOne<{ totalSales: string }>(),

        this.orderRepository
          .createQueryBuilder('order')
          .select('order.status', 'status')
          .addSelect('COUNT(*)', 'count')
          .groupBy('order.status')
          .getRawMany<{ status: string; count: string }>(),

        this.orderRepository
          .createQueryBuilder('order')
          .innerJoin('order.items', 'item')
          .select('item.productName', 'productName')
          .addSelect('SUM(item.quantity)', 'unitsSold')
          .addSelect('SUM(item.lineTotal)', 'revenue')
          .where('order.status != :status', { status: OrderStatus.CANCELLED })
          .groupBy('item.productName')
          .orderBy('SUM(item.quantity)', 'DESC')
          .limit(5)
          .getRawMany<{ productName: string; unitsSold: string; revenue: string }>(),
      ]);

    return {
      totalOrders,
      totalCustomers,
      totalSales: parseFloat(rawSales?.totalSales ?? '0'),
      ordersByStatus: rawByStatus.map((s) => ({
        status: s.status,
        count: parseInt(s.count, 10),
      })),
      topProducts: rawTopProducts.map((p) => ({
        productName: p.productName,
        unitsSold: parseInt(p.unitsSold, 10),
        revenue: parseFloat(p.revenue),
      })),
    };
  }
}
