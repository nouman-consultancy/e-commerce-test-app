'use client';

import { Chip } from '@mui/material';
import type { OrderStatus } from '@/types';

type Color = 'default' | 'primary' | 'warning' | 'success' | 'error';

const config: Record<OrderStatus, { label: string; color: Color }> = {
  pending: { label: 'Pending', color: 'default' },
  processing: { label: 'Processing', color: 'primary' },
  shipped: { label: 'Shipped', color: 'warning' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, color } = config[status] ?? config.pending;
  return <Chip label={label} color={color} size="small" />;
}
