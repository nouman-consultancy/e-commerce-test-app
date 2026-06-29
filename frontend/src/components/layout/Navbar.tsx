'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Divider,
  Avatar,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import useCartStore from '@/store/cartStore';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const totalItems = useCartStore((s) => s.totalItems);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleMenuClose();
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(15,23,42,0.06)',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: { xs: 60 } }}>
        {/* Logo */}
        <Box
          component={Link}
          href="/products"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
            flexGrow: 1,
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(99,102,241,0.35)',
            }}
          >
            <Typography sx={{ color: 'white', fontSize: '0.75rem', fontWeight: 800, lineHeight: 1 }}>
              S
            </Typography>
          </Box>
          <Typography
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.04em',
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #0f172a 0%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ShopApp
          </Typography>
        </Box>

        {/* Nav links */}
        <Button
          component={Link}
          href="/products"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '0.875rem',
            '&:hover': { color: 'text.primary', bgcolor: 'rgba(15,23,42,0.04)' },
          }}
        >
          Shop
        </Button>

        {session?.user?.role === 'admin' && (
          <Button
            component={Link}
            href="/admin/dashboard"
            size="small"
            sx={{
              bgcolor: 'rgba(99,102,241,0.08)',
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.8rem',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(99,102,241,0.14)', borderColor: 'primary.main' },
            }}
          >
            Admin
          </Button>
        )}

        {/* Cart */}
        <IconButton
          component={Link}
          href="/cart"
          size="small"
          sx={{
            bgcolor: totalItems > 0 ? 'rgba(99,102,241,0.08)' : 'transparent',
            border: totalItems > 0 ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
            borderRadius: 2,
            p: 1,
            '&:hover': { bgcolor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)' },
          }}
        >
          <Badge badgeContent={totalItems || null} color="primary">
            <ShoppingCartIcon fontSize="small" sx={{ color: totalItems > 0 ? 'primary.main' : 'text.secondary' }} />
          </Badge>
        </IconButton>

        {/* Auth */}
        {session ? (
          <>
            <Box
              onClick={handleMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                borderRadius: 2,
                px: 1,
                py: 0.5,
                border: '1px solid rgba(15,23,42,0.08)',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(15,23,42,0.04)', borderColor: 'rgba(99,102,241,0.3)' },
              }}
            >
              <Avatar
                sx={{
                  width: 26,
                  height: 26,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                }}
              >
                {initials}
              </Avatar>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.primary', maxWidth: 80 }} noWrap>
                {session.user?.name?.split(' ')[0]}
              </Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    borderRadius: 2,
                    border: '1px solid rgba(15,23,42,0.08)',
                    boxShadow: '0 10px 40px rgba(15,23,42,0.12)',
                    overflow: 'hidden',
                  },
                },
              }}
            >
              <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {session.user?.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {session.user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                component={Link}
                href="/orders"
                onClick={handleMenuClose}
                sx={{ fontSize: '0.875rem', py: 1.2, '&:hover': { bgcolor: 'rgba(99,102,241,0.06)', color: 'primary.main' } }}
              >
                My Orders
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleLogout}
                sx={{ fontSize: '0.875rem', py: 1.2, color: 'error.main', '&:hover': { bgcolor: 'rgba(239,68,68,0.06)' } }}
              >
                Sign Out
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            component={Link}
            href="/auth/login"
            variant="contained"
            size="small"
            sx={{ px: 2.5 }}
          >
            Sign In
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
