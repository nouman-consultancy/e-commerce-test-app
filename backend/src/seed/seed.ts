import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { ProductView } from '../products/entities/product-view.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'ecommerce',
  entities: [User, Product, ProductView, Cart, CartItem, Order, OrderItem],
  synchronize: true,
  logging: false,
});

const PRODUCTS = [
  {
    name: 'Wireless Headphones',
    description:
      'Premium noise-cancelling wireless headphones with 30-hour battery life and exceptional sound quality.',
    price: 79.99,
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format',
    category: 'Electronics',
    stock: 25,
  },
  {
    name: 'Laptop Pro 15"',
    description:
      'High-performance laptop with Intel Core i7, 16GB RAM, 512GB SSD, and a stunning 15-inch display.',
    price: 999.99,
    imageUrl:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format',
    category: 'Electronics',
    stock: 10,
  },
  {
    name: 'USB-C Hub 7-in-1',
    description:
      'Versatile USB-C hub with HDMI, USB 3.0, SD card reader, and 100W power delivery.',
    price: 34.99,
    imageUrl:
      'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&auto=format',
    category: 'Electronics',
    stock: 50,
  },
  {
    name: 'Mechanical Keyboard',
    description:
      'Compact TKL mechanical keyboard with Cherry MX switches and RGB backlighting.',
    price: 129.99,
    imageUrl:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format',
    category: 'Electronics',
    stock: 15,
  },
  {
    name: 'Classic White T-Shirt',
    description:
      'Premium 100% organic cotton crew neck t-shirt. Timeless style meets everyday comfort.',
    price: 19.99,
    imageUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format',
    category: 'Clothing',
    stock: 100,
  },
  {
    name: 'Slim Fit Jeans',
    description:
      'Classic slim fit jeans in stretch denim. A wardrobe essential in mid-blue wash.',
    price: 49.99,
    imageUrl:
      'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500&auto=format',
    category: 'Clothing',
    stock: 60,
  },
  {
    name: 'Hoodie Sweatshirt',
    description:
      'Cosy pullover hoodie made from fleece-lined cotton blend. Perfect for cool evenings.',
    price: 39.99,
    imageUrl:
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&auto=format',
    category: 'Clothing',
    stock: 40,
  },
  {
    name: 'Ceramic Plant Pot Set',
    description:
      'Set of 3 minimalist ceramic plant pots in graduated sizes with drainage holes and bamboo saucers.',
    price: 29.99,
    imageUrl:
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format',
    category: 'Home & Garden',
    stock: 30,
  },
  {
    name: 'Stainless Steel Water Bottle',
    description:
      'Double-wall insulated 750ml water bottle. Keeps drinks cold 24 hours, hot 12 hours.',
    price: 24.99,
    imageUrl:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format',
    category: 'Home & Garden',
    stock: 75,
  },
  {
    name: 'Scented Soy Candle',
    description:
      'Hand-poured soy wax candle with lavender and vanilla fragrance. 45-hour burn time.',
    price: 14.99,
    imageUrl:
      'https://images.unsplash.com/photo-1598755257130-c2ed7b40ec0d?w=500&auto=format',
    category: 'Home & Garden',
    stock: 60,
  },
];

async function seed() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();
  console.log('Connected. Seeding data...\n');

  const userRepo = AppDataSource.getRepository(User);
  const productRepo = AppDataSource.getRepository(Product);

  // Clear existing data in dependency order
  await AppDataSource.query('TRUNCATE TABLE product_views CASCADE');
  await AppDataSource.query('TRUNCATE TABLE order_items CASCADE');
  await AppDataSource.query('TRUNCATE TABLE orders CASCADE');
  await AppDataSource.query('TRUNCATE TABLE cart_items CASCADE');
  await AppDataSource.query('TRUNCATE TABLE carts CASCADE');
  await AppDataSource.query('TRUNCATE TABLE products CASCADE');
  await AppDataSource.query('TRUNCATE TABLE users CASCADE');
  console.log('Cleared existing data.');

  // Admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = userRepo.create({
    email: 'admin@shop.com',
    password: adminPassword,
    name: 'Admin User',
    role: UserRole.ADMIN,
  });
  await userRepo.save(admin);
  console.log('✓ Created admin:    admin@shop.com    / Admin123!');

  // Customer user
  const customerPassword = await bcrypt.hash('Customer123!', 12);
  const customer = userRepo.create({
    email: 'customer@shop.com',
    password: customerPassword,
    name: 'Test Customer',
    role: UserRole.CUSTOMER,
  });
  await userRepo.save(customer);
  console.log('✓ Created customer: customer@shop.com / Customer123!');

  // Products
  for (const p of PRODUCTS) {
    const product = productRepo.create(p);
    await productRepo.save(product);
  }
  console.log(`✓ Created ${PRODUCTS.length} products across 3 categories`);

  await AppDataSource.destroy();
  console.log('\nSeed complete!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
