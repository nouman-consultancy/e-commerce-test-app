'use client';

import { useState } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import toast from 'react-hot-toast';
import { Product } from '@/types';

export default function AddToCartButton({ product }: { product: Product }) {
  const maxQty = Math.min(10, product.stock);
  const [qty, setQty] = useState(1);

  if (product.stock === 0) {
    return (
      <Button variant="contained" disabled fullWidth size="large" sx={{ py: 1.5 }}>
        Out of Stock
      </Button>
    );
  }

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
            disabled={qty <= 1}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ px: 2, minWidth: 32, textAlign: 'center' }}>{qty}</Typography>
          <IconButton
            size="small"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={qty >= maxQty}
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
        startIcon={<ShoppingCartIcon />}
        onClick={() => toast.success('Added to cart — wiring coming in Feature 5!')}
        sx={{ py: 1.5 }}
      >
        Add to Cart
      </Button>
    </Box>
  );
}
