'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, Button, IconButton, Typography, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useCartStore from '@/store/cartStore';
import type { Product } from '@/types';

export default function AddToCartButton({ product }: { product: Product }) {
  const { data: session } = useSession();
  const router = useRouter();
  const setCart = useCartStore((s) => s.setCart);
  const maxQty = Math.min(10, product.stock);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  if (product.stock === 0) {
    return (
      <Button variant="contained" disabled fullWidth size="large" sx={{ py: 1.5 }}>
        Out of Stock
      </Button>
    );
  }

  const handleAddToCart = async () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/cart/items', { productId: product.id, quantity: qty });
      setCart(res.data);
      toast.success(`${product.name} added to cart!`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to add to cart';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Quantity:
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1 || loading}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ px: 2, minWidth: 32, textAlign: 'center' }}>{qty}</Typography>
          <IconButton
            size="small"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={qty >= maxQty || loading}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography variant="caption" color="text.secondary">
          ({product.stock} available)
        </Typography>
      </Box>

      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={
          loading ? <CircularProgress size={18} color="inherit" /> : <ShoppingCartIcon />
        }
        onClick={handleAddToCart}
        disabled={loading}
        sx={{ py: 1.5 }}
      >
        {loading ? 'Adding…' : session ? 'Add to Cart' : 'Sign In to Add'}
      </Button>
    </Box>
  );
}
