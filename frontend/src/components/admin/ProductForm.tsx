'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { Product } from '@/types';
import ProductImage from '@/components/ui/ProductImage';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  price: yup
    .number()
    .typeError('Price must be a number')
    .positive('Must be positive')
    .required('Price is required'),
  imageUrl: yup.string().url('Must be a valid URL').required('Image URL is required'),
  category: yup.string().required('Category is required'),
  stock: yup
    .number()
    .typeError('Stock must be a number')
    .integer('Must be a whole number')
    .min(0, 'Cannot be negative')
    .required('Stock is required'),
});

type FormValues = yup.InferType<typeof schema>;

interface Props {
  product?: Product;
}

export default function ProductForm({ product }: Props) {
  const router = useRouter();
  const isEdit = !!product;
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          price: Number(product.price),
          imageUrl: product.imageUrl,
          category: product.category,
          stock: product.stock,
        }
      : undefined,
  });

  const watchedImageUrl = watch('imageUrl');
  const watchedName = watch('name');

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.patch(`/admin/products/${product.id}`, data);
        toast.success('Product updated');
      } else {
        await api.post('/admin/products', data);
        toast.success('Product created');
      }
      router.push('/admin/products');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message ?? 'Operation failed';
      toast.error(Array.isArray(msg) ? msg[0] : (msg as string));
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, flex: 1 }}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          <TextField
            {...register('name')}
            label="Product name"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            {...register('description')}
            label="Description"
            fullWidth
            multiline
            rows={4}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              {...register('price')}
              label="Price (£)"
              type="number"
              fullWidth
              inputProps={{ step: '0.01', min: '0' }}
              error={!!errors.price}
              helperText={errors.price?.message}
            />
            <TextField
              {...register('stock')}
              label="Stock"
              type="number"
              fullWidth
              inputProps={{ step: '1', min: '0' }}
              error={!!errors.stock}
              helperText={errors.stock?.message}
            />
          </Box>
          <TextField
            {...register('category')}
            label="Category"
            fullWidth
            error={!!errors.category}
            helperText={errors.category?.message}
          />
          <TextField
            {...register('imageUrl')}
            label="Image URL"
            fullWidth
            error={!!errors.imageUrl}
            helperText={errors.imageUrl?.message}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 1 }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/admin/products')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disableElevation
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {submitting ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {watchedImageUrl && (
        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: 2, width: { xs: '100%', md: 260 }, flexShrink: 0 }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Image Preview
          </Typography>
          <Box sx={{ width: '100%', height: 200, borderRadius: 1, overflow: 'hidden' }}>
            <ProductImage
              src={watchedImageUrl}
              name={watchedName || 'Preview'}
              initialsSize="2.5rem"
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
}
