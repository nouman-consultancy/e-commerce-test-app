'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.get<Product[]>('/admin/products').then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product soft-deleted');
      setDeleteId(null);
    },
    onError: () => toast.error('Delete failed'),
  });

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 180 },
    { field: 'category', headerName: 'Category', width: 140 },
    {
      field: 'price',
      headerName: 'Price',
      width: 110,
      renderCell: (params: GridRenderCellParams) => formatPrice(params.value),
    },
    { field: 'stock', headerName: 'Stock', width: 80, type: 'number' },
    { field: 'isActive', headerName: 'Active', width: 80, type: 'boolean' },
    {
      field: 'actions',
      headerName: '',
      width: 160,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Button
            component={Link}
            href={`/admin/products/${params.row.id}`}
            size="small"
            variant="outlined"
          >
            Edit
          </Button>
          {params.row.isActive && (
            <Button size="small" color="error" onClick={() => setDeleteId(params.row.id as string)}>
              Delete
            </Button>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Products
        </Typography>
        <Button
          component={Link}
          href="/admin/products/new"
          variant="contained"
          startIcon={<AddIcon />}
          disableElevation
        >
          Add Product
        </Button>
      </Box>

      <Box sx={{ height: 560, bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={products}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Box>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Product?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will soft-delete the product. Existing order history will not be affected.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disableElevation
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
