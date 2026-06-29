import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { serverFetch } from '@/lib/server-api';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Order } from '@/types';
import { formatPrice, formatDate, shortId } from '@/lib/utils';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') redirect('/auth/login');

  const order = await serverFetch<Order>(
    `/admin/orders/${id}`,
    session.user.accessToken,
  ).catch(() => null);

  if (!order) notFound();

  return (
    <div className="p-6 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/orders" className="hover:text-gray-900 transition-colors">
          Orders
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">#{shortId(order.id)}</span>
      </nav>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
        <StatusBadge status={order.status} />
      </div>

      {/* Meta grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Order ID</p>
          <p className="font-mono font-semibold mt-0.5">#{shortId(order.id)}</p>
        </div>
        <div>
          <p className="text-gray-500">Date</p>
          <p className="font-semibold mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <div>
          <p className="text-gray-500">Customer</p>
          <p className="font-semibold mt-0.5">{order.user?.name ?? 'Unknown'}</p>
          <p className="text-gray-500 text-xs">{order.user?.email}</p>
        </div>
        <div>
          <p className="text-gray-500">Payment Ref</p>
          <p className="font-mono text-xs mt-0.5 break-all">{order.paymentRef}</p>
        </div>
        {order.shippingAddress && (
          <div className="col-span-2">
            <p className="text-gray-500">Shipping Address</p>
            <p className="mt-0.5">
              {[
                order.shippingAddress.street,
                order.shippingAddress.city,
                order.shippingAddress.postcode,
              ]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Items ({order.items.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.quantity} × {formatPrice(item.productPrice)}
                </p>
              </div>
              <p className="text-sm font-semibold shrink-0">{formatPrice(item.lineTotal)}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between px-5 py-4 bg-gray-50 border-t border-gray-200">
          <p className="font-semibold">Total</p>
          <p className="font-bold">{formatPrice(order.totalAmount)}</p>
        </div>
      </div>

      <Link
        href="/admin/orders"
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        ← Back to orders
      </Link>
    </div>
  );
}
