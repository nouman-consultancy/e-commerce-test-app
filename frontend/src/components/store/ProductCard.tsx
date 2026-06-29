'use client';

import Link from 'next/link';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
} from '@mui/material';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={
          product.imageUrl ||
          `https://placehold.co/400x300/e2e8f0/64748b?text=${encodeURIComponent(product.name)}`
        }
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Chip label={product.category} size="small" sx={{ mb: 1 }} />
        <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600 }} noWrap gutterBottom>
          {product.name}
        </Typography>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
          {formatPrice(product.price)}
        </Typography>
        {product.stock === 0 && (
          <Typography variant="caption" sx={{ color: 'error.main' }}>
            Out of stock
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ pt: 0 }}>
        <Button
          component={Link}
          href={`/products/${product.id}`}
          variant="outlined"
          size="small"
          fullWidth
        >
          View Product
        </Button>
      </CardActions>
    </Card>
  );
}
