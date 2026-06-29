'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { Order, OrderStatus } from '@/types';
import { formatPrice, formatDate, shortId } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';

type TabStatus = 'all' | OrderStatus;

const TAB_OPTIONS: { label: string; value: TabStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

const VALID_NEXT: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
};

const ALL_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function StatusSelectCell({
  order,
  onUpdate,
}: {
  order: Order;
  onUpdate: (id: string, status: OrderStatus) => void;
}) {
  const validNext = VALID_NEXT[order.status] ?? [];

  if (validNext.length === 0) {
    return <StatusBadge status={order.status} />;
  }

  const handleChange = (e: SelectChangeEvent) => {
    onUpdate(order.id, e.target.value as OrderStatus);
  };

  return (
    <Select
      value={order.status}
      size="small"
      onChange={handleChange}
      sx={{ minWidth: 140, fontSize: '0.8125rem' }}
    >
      <MenuItem value={order.status} disabled>
        {STATUS_LABELS[order.status]}
      </MenuItem>
      {validNext.map((s) => (
        <MenuItem key={s} value={s}>
          {STATUS_LABELS[s]}
        </MenuItem>
      ))}
    </Select>
  );
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabStatus>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', activeTab],
    queryFn: () => {
      const qs = activeTab !== 'all' ? `?status=${activeTab}` : '';
      return api
        .get<{ data: Order[]; total: number }>(`/admin/orders${qs}`)
        .then((r) => r.data);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Status updated');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to update status';
      toast.error(msg);
    },
  });

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Order',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Link
          href={`/admin/orders/${params.row.id}`}
          style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8125rem' }}
        >
          #{shortId(params.row.id as string)}
        </Link>
      ),
    },
    {
      field: 'user',
      headerName: 'Customer',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
            {params.row.user?.name ?? 'Unknown'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
            {params.row.user?.email ?? ''}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 130,
      renderCell: (params: GridRenderCellParams) =>
        formatDate(params.row.createdAt as string),
    },
    {
      field: 'items',
      headerName: 'Items',
      width: 70,
      renderCell: (params: GridRenderCellParams) =>
        (params.row.items as unknown[])?.length ?? 0,
    },
    {
      field: 'totalAmount',
      headerName: 'Total',
      width: 110,
      renderCell: (params: GridRenderCellParams) =>
        formatPrice(params.row.totalAmount as number),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <StatusSelectCell
            order={params.row as Order}
            onUpdate={(id, status) => statusMutation.mutate({ id, status })}
          />
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Orders
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, val: TabStatus) => setActiveTab(val)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {TAB_OPTIONS.map(({ label, value }) => (
          <Tab key={value} label={label} value={value} />
        ))}
      </Tabs>

      <Box sx={{ height: 560, bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={data?.data ?? []}
          columns={columns}
          loading={isLoading}
          rowHeight={60}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Box>
    </Container>
  );
}
