'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '@/lib/api';
import type { Order } from '@/types';
import { formatPrice, formatDate, shortId } from '@/lib/utils';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) router.replace('/products');
  }, [orderId, router]);

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.get<Order>(`/orders/${orderId}`).then((r) => r.data),
    enabled: !!orderId,
    retry: 2,
  });

  if (!orderId || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !order) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">Could not load order details.</Alert>
        <Button component={Link} href="/products" sx={{ mt: 2 }}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 2 }}>
          Order Confirmed!
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Thank you for your purchase.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Order ID
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>#{shortId(order.id)}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Date
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>{formatDate(order.createdAt)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
          {order.items.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item.productName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.quantity} × {formatPrice(item.productPrice)}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatPrice(item.lineTotal)}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {formatPrice(order.totalAmount)}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
        <Button
          component={Link}
          href="/orders"
          variant="contained"
          size="large"
          fullWidth
          disableElevation
        >
          View My Orders
        </Button>
        <Button component={Link} href="/products" variant="outlined" size="large" fullWidth>
          Continue Shopping
        </Button>
      </Box>
    </Container>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
