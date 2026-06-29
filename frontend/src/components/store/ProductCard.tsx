'use client';

import Link from 'next/link';
import { Card, CardContent, CardActions, Typography, Chip, Button, Box } from '@mui/material';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import ProductImage from '@/components/ui/ProductImage';

export default function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = product.stock === 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(15,23,42,0.12)',
        },
        '&:hover .product-image': {
          transform: 'scale(1.06)',
        },
      }}
    >
      {/* Image area */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          aspectRatio: '4/3',
        }}
      >
        <ProductImage
          src={product.imageUrl}
          name={product.name}
          imgClassName="product-image"
          imgSx={{ transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)' }}
        />

        {/* Category chip overlay */}
        <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
          <Chip
            label={product.category}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(8px)',
              fontWeight: 600,
              fontSize: '0.68rem',
              color: 'text.primary',
              height: 22,
              border: '1px solid rgba(255,255,255,0.8)',
            }}
          />
        </Box>

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(15,23,42,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                bgcolor: 'rgba(15,23,42,0.6)',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              Sold Out
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ flex: 1, p: 2.5, pb: 1.5 }}>
        <Typography
          component="h3"
          sx={{
            fontWeight: 600,
            fontSize: '0.925rem',
            lineHeight: 1.35,
            mb: 0.75,
            color: 'text.primary',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.name}
        </Typography>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '1.15rem',
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: isOutOfStock ? undefined : 'transparent',
            color: isOutOfStock ? 'text.disabled' : undefined,
          }}
        >
          {formatPrice(product.price)}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2.5, pt: 0.5 }}>
        <Button
          component={Link}
          href={`/products/${product.id}`}
          variant="contained"
          size="small"
          fullWidth
          disabled={isOutOfStock}
          sx={{ py: 0.9, fontSize: '0.82rem' }}
        >
          {isOutOfStock ? 'Out of Stock' : 'View Product'}
        </Button>
      </CardActions>
    </Card>
  );
}
