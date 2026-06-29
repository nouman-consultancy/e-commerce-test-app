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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import TuneIcon from '@mui/icons-material/Tune';

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
      if (value) params.set(key, value);
      else params.delete(key);
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
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TuneIcon sx={{ fontSize: 18, color: 'primary.main' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.01em' }}>
          Filters
        </Typography>
      </Box>

      {/* Search */}
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
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
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

      {/* Category */}
      <Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            display: 'block',
            mb: 1.5,
          }}
        >
          Category
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              size="small"
              clickable
              onClick={() => handleCategoryClick(cat)}
              sx={
                currentCategory === cat
                  ? {
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff',
                      fontWeight: 700,
                      border: 'none',
                    }
                  : {
                      bgcolor: 'rgba(15,23,42,0.04)',
                      color: 'text.secondary',
                      border: '1px solid rgba(15,23,42,0.08)',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: 'rgba(99,102,241,0.08)',
                        color: 'primary.main',
                        borderColor: 'rgba(99,102,241,0.3)',
                      },
                    }
              }
            />
          ))}
        </Box>
      </Box>

      {/* Sort */}
      <Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            display: 'block',
            mb: 1.5,
          }}
        >
          Sort by
        </Typography>
        <FormControl size="small" fullWidth>
          <InputLabel>Order</InputLabel>
          <Select
            value={currentSort}
            label="Order"
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <MenuItem value="createdAt-desc">Newest first</MenuItem>
            <MenuItem value="createdAt-asc">Oldest first</MenuItem>
            <MenuItem value="price-asc">Price: Low to High</MenuItem>
            <MenuItem value="price-desc">Price: High to Low</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
