import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-6">Analytics and stats — coming in a future update.</p>
      <div className="flex gap-3">
        <Link
          href="/admin/products"
          className="inline-block bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Manage Products →
        </Link>
        <Link
          href="/admin/orders"
          className="inline-block border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          View Orders →
        </Link>
      </div>
    </div>
  );
}
