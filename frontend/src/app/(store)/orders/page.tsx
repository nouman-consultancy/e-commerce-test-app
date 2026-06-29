import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { serverFetch } from '@/lib/server-api';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Order } from '@/types';
import { formatPrice, formatDate, shortId } from '@/lib/utils';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login');

  const result = await serverFetch<{ data: Order[]; total: number }>(
    '/orders',
    session.user.accessToken,
  ).catch(() => null);

  const orders = result?.data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg mb-4">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/products"
            className="inline-block bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header row */}
          <div className="hidden sm:grid grid-cols-5 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span>Order</span>
            <span>Date</span>
            <span>Items</span>
            <span>Total</span>
            <span>Status</span>
          </div>

          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-center px-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
            >
              <span className="font-mono text-sm font-semibold text-gray-900">
                #{shortId(order.id)}
              </span>
              <span className="text-sm text-gray-500 sm:col-auto col-start-2 text-right sm:text-left">
                {formatDate(order.createdAt)}
              </span>
              <span className="text-sm text-gray-600 hidden sm:block">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </span>
              <span className="text-sm font-semibold text-gray-900 hidden sm:block">
                {formatPrice(order.totalAmount)}
              </span>
              <span className="hidden sm:block">
                <StatusBadge status={order.status} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
