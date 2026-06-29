'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export default function ProductFilters({ categories }: { categories: string[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentCategory = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const currentSort = `${sortBy}-${sortOrder}`;

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined });
  };

  const handleCategoryClick = (cat: string) => {
    updateFilters({ category: cat === currentCategory ? undefined : cat });
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    updateFilters({ sortBy: newSortBy, sortOrder: newSortOrder });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box component="form" onSubmit={handleSearchSubmit}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search products…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchInput ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchInput('');
                      updateFilters({ search: undefined });
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
      </Box>

      <Divider />

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }} gutterBottom>
          Category
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              size="small"
              clickable
              color={currentCategory === cat ? 'primary' : 'default'}
              onClick={() => handleCategoryClick(cat)}
            />
          ))}
        </Box>
      </Box>

      <Divider />

      <FormControl size="small" fullWidth>
        <InputLabel>Sort by</InputLabel>
        <Select
          value={currentSort}
          label="Sort by"
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <MenuItem value="createdAt-desc">Newest first</MenuItem>
          <MenuItem value="createdAt-asc">Oldest first</MenuItem>
          <MenuItem value="price-asc">Price: Low to High</MenuItem>
          <MenuItem value="price-desc">Price: High to Low</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
