'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import useCartStore from '@/store/cartStore';
import CartItemRow from '@/components/store/CartItemRow';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { data: session } = useSession();
  const { items, totalItems, totalPrice } = useCartStore();

  if (totalItems === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
        <Typography variant="h5" sx={{ fontWeight: 600, mt: 2 }}>
          Your cart is empty
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add some products to get started
        </Typography>
        <Button
          component={Link}
          href="/products"
          variant="contained"
          size="large"
          disableElevation
          sx={{ mt: 4 }}
        >
          Browse Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: 1 }}>
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </Box>

        <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0 }}>
          <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 80 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Order Summary
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">
                Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{formatPrice(totalPrice)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">Shipping</Typography>
              <Typography sx={{ color: 'success.main' }}>Free</Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatPrice(totalPrice)}
              </Typography>
            </Box>

            <Button
              component={Link}
              href="/checkout"
              variant="contained"
              fullWidth
              size="large"
              disableElevation
              disabled={!session}
              sx={{ py: 1.5 }}
            >
              {session ? 'Proceed to Checkout' : 'Sign In to Checkout'}
            </Button>

            {!session && (
              <Button
                component={Link}
                href="/auth/login"
                variant="outlined"
                fullWidth
                size="large"
                sx={{ mt: 1.5 }}
              >
                Sign In
              </Button>
            )}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
