'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Pagination } from '@mui/material';

interface ProductPaginationProps {
  total: number;
  page: number;
  limit: number;
}

export default function ProductPagination({ total, page, limit }: ProductPaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageCount = Math.ceil(total / limit);

  if (pageCount <= 1) return null;

  const handleChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/products?${params.toString()}`);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Pagination
        count={pageCount}
        page={page}
        onChange={handleChange}
        color="primary"
        shape="rounded"
      />
    </Box>
  );
}
