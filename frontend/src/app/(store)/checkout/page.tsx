'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useCartStore from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

const schema = yup.object({
  street: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  postcode: yup.string().required('Postcode is required'),
  cardNumber: yup
    .string()
    .matches(/^\d{16}$/, 'Enter exactly 16 digits (no spaces)')
    .required('Card number is required'),
  expiry: yup
    .string()
    .matches(/^\d{2}\/\d{2}$/, 'Format: MM/YY')
    .required('Expiry is required'),
  cvv: yup
    .string()
    .matches(/^\d{3}$/, 'Enter 3 digits')
    .required('CVV is required'),
});

type FormValues = yup.InferType<typeof schema>;

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, totalPrice, totalItems, clear } = useCartStore();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'loading' && totalItems === 0) router.replace('/cart');
  }, [totalItems, status, router]);

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const res = await api.post('/orders', {
        shippingAddress: { street: data.street, city: data.city, postcode: data.postcode },
      });
      clear();
      router.push(`/checkout/success?orderId=${res.data.id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message || 'Failed to place order';
      toast.error(Array.isArray(msg) ? msg[0] : (msg as string));
      setSubmitting(false);
    }
  };

  if (status === 'loading' || !session || totalItems === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Checkout
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start' }}
      >
        {/* Left: address + payment */}
        <Box sx={{ flex: 1 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Shipping Address
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                {...register('street')}
                label="Street address"
                fullWidth
                error={!!errors.street}
                helperText={errors.street?.message}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  {...register('city')}
                  label="City"
                  fullWidth
                  error={!!errors.city}
                  helperText={errors.city?.message}
                />
                <TextField
                  {...register('postcode')}
                  label="Postcode"
                  fullWidth
                  error={!!errors.postcode}
                  helperText={errors.postcode?.message}
                />
              </Box>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LockIcon fontSize="small" color="action" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Payment Details
              </Typography>
            </Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Test Mode — any card values are accepted
            </Alert>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                {...register('cardNumber')}
                label="Card number"
                fullWidth
                placeholder="1234567890123456"
                inputProps={{ maxLength: 16, inputMode: 'numeric' }}
                error={!!errors.cardNumber}
                helperText={errors.cardNumber?.message}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  {...register('expiry')}
                  label="Expiry (MM/YY)"
                  fullWidth
                  placeholder="12/26"
                  inputProps={{ maxLength: 5 }}
                  error={!!errors.expiry}
                  helperText={errors.expiry?.message}
                />
                <TextField
                  {...register('cvv')}
                  label="CVV"
                  fullWidth
                  placeholder="123"
                  inputProps={{ maxLength: 3, inputMode: 'numeric' }}
                  error={!!errors.cvv}
                  helperText={errors.cvv?.message}
                />
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Right: order summary */}
        <Box sx={{ width: { xs: '100%', md: 360 }, flexShrink: 0 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 80 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Order Summary
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
              {items.map((item) => (
                <Box
                  key={item.id}
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                >
                  <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                      {item.product?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.quantity} × {formatPrice(item.product?.price ?? 0)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatPrice(Number(item.product?.price ?? 0) * item.quantity)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatPrice(totalPrice)}
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disableElevation
              disabled={submitting}
              startIcon={
                submitting ? <CircularProgress size={18} color="inherit" /> : <LockIcon />
              }
              sx={{ py: 1.5 }}
            >
              {submitting ? 'Placing Order…' : 'Place Order'}
            </Button>

            <Button component={Link} href="/cart" fullWidth sx={{ mt: 1.5 }}>
              Back to Cart
            </Button>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
