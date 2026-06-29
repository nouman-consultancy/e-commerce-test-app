'use client';

import { useQuery } from '@tanstack/react-query';
import { Box, Container, Typography, Paper, CircularProgress } from '@mui/material';
import api from '@/lib/api';
import type { DashboardStats, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/utils';
import DashboardChart from '@/components/admin/DashboardChart';

const ALL_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

function StatCard({
  title,
  value,
  subtitle,
  accentColor,
}: {
  title: string;
  value: string;
  subtitle: string;
  accentColor: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 2,
        borderLeftWidth: 4,
        borderLeftColor: accentColor,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.25 }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    </Paper>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get<DashboardStats>('/admin/dashboard').then((r) => r.data),
  });

  if (isLoading || !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  const pendingCount =
    stats.ordersByStatus.find((s) => s.status === 'pending')?.count ?? 0;

  const chartData = ALL_STATUSES.map((status) => ({
    status,
    count: stats.ordersByStatus.find((s) => s.status === status)?.count ?? 0,
  }));

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>
        Dashboard
      </Typography>

      {/* Stat cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats.totalSales)}
          subtitle="Excluding cancelled orders"
          accentColor="#1a1a2e"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          subtitle="All time"
          accentColor="#1976d2"
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers.toLocaleString()}
          subtitle="Registered accounts"
          accentColor="#2e7d32"
        />
        <StatCard
          title="Pending Orders"
          value={pendingCount.toLocaleString()}
          subtitle="Awaiting processing"
          accentColor="#ed6c02"
        />
      </Box>

      {/* Chart + Top Products */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 3,
        }}
      >
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Orders by Status
          </Typography>
          <DashboardChart data={chartData} />
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Top Products
          </Typography>

          {stats.topProducts.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No completed orders yet.
            </Typography>
          ) : (
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <Box component="thead">
                <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                  {['#', 'Product', 'Sold', 'Revenue'].map((h) => (
                    <Box
                      key={h}
                      component="th"
                      sx={{
                        pb: 1.5,
                        pr: 2,
                        textAlign: 'left',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {h}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {stats.topProducts.map((product, i) => (
                  <Box
                    key={product.productName}
                    component="tr"
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Box
                      component="td"
                      sx={{ py: 1.5, pr: 2, color: 'text.secondary', fontSize: '0.875rem' }}
                    >
                      {i + 1}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        py: 1.5,
                        pr: 2,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {product.productName}
                    </Box>
                    <Box component="td" sx={{ py: 1.5, pr: 2, fontSize: '0.875rem' }}>
                      {product.unitsSold}
                    </Box>
                    <Box component="td" sx={{ py: 1.5, fontSize: '0.875rem', fontWeight: 600 }}>
                      {formatPrice(product.revenue)}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
