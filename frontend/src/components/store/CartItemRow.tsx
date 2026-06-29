'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Typography, IconButton, Paper, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useCartStore from '@/store/cartStore';
import type { CartItem } from '@/types';
import { formatPrice } from '@/lib/utils';
import ProductImage from '@/components/ui/ProductImage';

export default function CartItemRow({ item }: { item: CartItem }) {
  const setCart = useCartStore((s) => s.setCart);
  const [loading, setLoading] = useState(false);
  const maxQty = Math.min(10, item.product?.stock ?? 0);

  const handleQtyChange = async (newQty: number) => {
    setLoading(true);
    try {
      if (newQty === 0) {
        const res = await api.delete(`/cart/items/${item.productId}`);
        setCart(res.data);
      } else {
        const res = await api.put(`/cart/items/${item.productId}`, { quantity: newQty });
        setCart(res.data);
      }
    } catch {
      toast.error('Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const lineTotal = Number(item.product?.price ?? 0) * item.quantity;

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center', borderRadius: 2 }}
    >
      <Link href={`/products/${item.productId}`} style={{ flexShrink: 0 }}>
        <Box sx={{ width: 80, height: 80, borderRadius: 1, overflow: 'hidden' }}>
          <ProductImage
            src={item.product?.imageUrl}
            name={item.product?.name || ''}
            initialsSize="1.5rem"
          />
        </Box>
      </Link>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Link href={`/products/${item.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
            {item.product?.name}
          </Typography>
        </Link>
        <Typography variant="body2" color="text.secondary">
          {formatPrice(item.product?.price ?? 0)} each
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <IconButton
          size="small"
          onClick={() => handleQtyChange(item.quantity - 1)}
          disabled={loading}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
        {loading ? (
          <Box sx={{ px: 1.5, width: 28, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={14} />
          </Box>
        ) : (
          <Typography sx={{ px: 1.5, minWidth: 28, textAlign: 'center' }}>
            {item.quantity}
          </Typography>
        )}
        <IconButton
          size="small"
          onClick={() => handleQtyChange(item.quantity + 1)}
          disabled={loading || item.quantity >= maxQty}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>

      <Typography sx={{ fontWeight: 700, minWidth: 80, textAlign: 'right' }}>
        {formatPrice(lineTotal)}
      </Typography>

      <IconButton
        onClick={() => handleQtyChange(0)}
        disabled={loading}
        sx={{ color: 'error.main' }}
        size="small"
      >
        <DeleteIcon />
      </IconButton>
    </Paper>
  );
}
