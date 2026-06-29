import { Suspense } from 'react';
import { serverFetch } from '@/lib/server-api';
import type { Product, PaginatedResponse } from '@/types';
import ProductGrid from '@/components/store/ProductGrid';
import ProductFilters from '@/components/store/ProductFilters';
import ProductPagination from '@/components/store/ProductPagination';

type SearchParams = {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const qs = new URLSearchParams();
  if (sp.search) qs.set('search', sp.search);
  if (sp.category) qs.set('category', sp.category);
  if (sp.minPrice) qs.set('minPrice', sp.minPrice);
  if (sp.maxPrice) qs.set('maxPrice', sp.maxPrice);
  if (sp.sortBy) qs.set('sortBy', sp.sortBy);
  if (sp.sortOrder) qs.set('sortOrder', sp.sortOrder);
  if (sp.page) qs.set('page', sp.page);

  const [products, categories] = await Promise.all([
    serverFetch<PaginatedResponse<Product>>(`/products?${qs.toString()}`),
    serverFetch<string[]>('/products/categories'),
  ]);

  const currentPage = parseInt(sp.page || '1', 10);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
        <p className="text-gray-500 mt-1">{products.total} products</p>
      </div>

      <div className="flex gap-8">
        <aside className="w-64 flex-shrink-0">
          <Suspense
            fallback={
              <div className="bg-white rounded-lg border border-gray-200 p-4 h-64 animate-pulse" />
            }
          >
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
              <ProductFilters categories={categories} />
            </div>
          </Suspense>
        </aside>

        <div className="flex-1 min-w-0">
          <ProductGrid products={products.data} />
          <Suspense fallback={null}>
            <ProductPagination
              total={products.total}
              page={currentPage}
              limit={products.limit}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
