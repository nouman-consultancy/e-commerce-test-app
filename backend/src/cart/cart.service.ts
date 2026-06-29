import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductsService } from '../products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
  ) {}

  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({ where: { userId } });
    if (!cart) {
      await this.cartRepository.save(this.cartRepository.create({ userId }));
      cart = await this.cartRepository.findOne({ where: { userId } }) as Cart;
    }
    return cart;
  }

  async addItem(userId: string, dto: AddToCartDto): Promise<Cart> {
    const cart = await this.getCart(userId);
    const product = await this.productsService.findOne(dto.productId);

    const existingItem = cart.items.find((i) => i.productId === dto.productId);

    if (existingItem) {
      const newQty = existingItem.quantity + dto.quantity;
      if (newQty > product.stock) {
        throw new ConflictException(
          `Only ${product.stock} of '${product.name}' available`,
        );
      }
      existingItem.quantity = newQty;
      await this.cartItemRepository.save(existingItem);
    } else {
      if (dto.quantity > product.stock) {
        throw new ConflictException(
          `Only ${product.stock} of '${product.name}' available`,
        );
      }
      await this.cartItemRepository.save(
        this.cartItemRepository.create({
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
        }),
      );
    }

    return this.getCart(userId);
  }

  async updateItem(
    userId: string,
    productId: string,
    dto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getCart(userId);
    const item = cart.items.find((i) => i.productId === productId);

    if (!item) throw new NotFoundException('Cart item not found');

    if (dto.quantity === 0) {
      await this.cartItemRepository.delete(item.id);
      return this.getCart(userId);
    }

    const product = await this.productsService.findOne(productId);
    if (dto.quantity > product.stock) {
      throw new ConflictException(
        `Only ${product.stock} of '${product.name}' available`,
      );
    }

    item.quantity = dto.quantity;
    await this.cartItemRepository.save(item);
    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    const item = cart.items.find((i) => i.productId === productId);

    if (!item) throw new NotFoundException('Cart item not found');

    await this.cartItemRepository.delete(item.id);
    return this.getCart(userId);
  }
}
