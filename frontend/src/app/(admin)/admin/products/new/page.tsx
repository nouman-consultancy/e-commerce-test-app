import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="p-6">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/products" className="hover:text-gray-900 transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">New Product</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>
      <ProductForm />
    </div>
  );
}
