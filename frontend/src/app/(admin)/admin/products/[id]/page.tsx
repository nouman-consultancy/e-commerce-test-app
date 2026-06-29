import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { serverFetch } from '@/lib/server-api';
import ProductForm from '@/components/admin/ProductForm';
import type { Product } from '@/types';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') redirect('/auth/login');

  const product = await serverFetch<Product>(
    `/admin/products/${id}`,
    session.user.accessToken,
  ).catch(() => null);

  if (!product) notFound();

  return (
    <div className="p-6">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/products" className="hover:text-gray-900 transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  );
}
