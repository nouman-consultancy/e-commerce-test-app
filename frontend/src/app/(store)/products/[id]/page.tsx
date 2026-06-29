import { notFound } from 'next/navigation';
import Link from 'next/link';
import { serverFetch } from '@/lib/server-api';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import AddToCartButton from '@/components/store/AddToCartButton';
import ProductSuggestions from '@/components/store/ProductSuggestions';
import ProductImage from '@/components/ui/ProductImage';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await serverFetch<Product>(`/products/${id}`).catch(() => null);
  if (!product) notFound();

  const stockBadge =
    product.stock === 0
      ? { label: 'Out of Stock', classes: 'bg-red-100 text-red-800' }
      : product.stock <= 10
        ? { label: `Low Stock (${product.stock} left)`, classes: 'bg-yellow-100 text-yellow-800' }
        : { label: 'In Stock', classes: 'bg-green-100 text-green-800' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-gray-800 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-gray-800 transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="aspect-square rounded-2xl overflow-hidden">
          <ProductImage src={product.imageUrl} name={product.name} initialsSize="4rem" />
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          </div>

          <p className="text-4xl font-bold text-gray-900">{formatPrice(product.price)}</p>

          <span
            className={`inline-flex w-fit items-center px-3 py-1 rounded-full text-sm font-medium ${stockBadge.classes}`}
          >
            {stockBadge.label}
          </span>

          {product.description && (
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          )}

          <AddToCartButton product={product} />
        </div>
      </div>

      <ProductSuggestions productId={id} category={product.category} />
    </div>
  );
}
