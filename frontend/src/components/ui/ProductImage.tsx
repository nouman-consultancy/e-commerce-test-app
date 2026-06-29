'use client';

import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

interface ProductImageProps {
  src?: string | null;
  name: string;
  imgClassName?: string;
  imgSx?: SxProps<Theme>;
  initialsSize?: string;
}

export default function ProductImage({
  src,
  name,
  imgClassName,
  imgSx,
  initialsSize = '2.25rem',
}: ProductImageProps) {
  const [imgError, setImgError] = useState(false);
  const showFallback = imgError || !src;

  return (
    <>
      {showFallback ? (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
          }}
        >
          <Typography
            sx={{
              fontSize: initialsSize,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              userSelect: 'none',
            }}
          >
            {getInitials(name)}
          </Typography>
        </Box>
      ) : (
        <Box
          component="img"
          className={imgClassName}
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            ...imgSx,
          }}
        />
      )}
    </>
  );
}
