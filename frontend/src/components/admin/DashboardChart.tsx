'use client';

import { Box, Typography } from '@mui/material';

const STATUS_COLORS: Record<string, string> = {
  pending: '#9E9E9E',
  processing: '#1976d2',
  shipped: '#ed6c02',
  delivered: '#2e7d32',
  cancelled: '#d32f2f',
};

interface Props {
  data: { status: string; count: number }[];
}

export default function DashboardChart({ data }: Props) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Box sx={{ pb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 200 }}>
        {data.map(({ status, count }) => (
          <Box
            key={status}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 700 }}>
              {count > 0 ? count : ''}
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: count > 0 ? `${(count / maxCount) * 160}px` : '4px',
                bgcolor: count > 0 ? STATUS_COLORS[status] ?? '#888' : 'grey.200',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.4s ease',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                mt: 1,
                textTransform: 'capitalize',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              {status}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
