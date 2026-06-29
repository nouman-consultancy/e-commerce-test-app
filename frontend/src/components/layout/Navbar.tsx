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
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import StorefrontIcon from '@mui/icons-material/Storefront';
import useCartStore from '@/store/cartStore';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const totalItems = useCartStore((s) => s.totalItems);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleMenuClose();
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary' }}>
      <Toolbar sx={{ gap: 1 }}>
        <StorefrontIcon sx={{ mr: 0.5, color: 'secondary.main' }} />
        <Typography
          variant="h6"
          component={Link}
          href="/products"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 800, letterSpacing: -0.5 }}
        >
          ShopApp
        </Typography>

        <Button component={Link} href="/products" color="inherit" size="small">
          Shop
        </Button>

        {session?.user?.role === 'admin' && (
          <Button
            component={Link}
            href="/admin/dashboard"
            color="secondary"
            size="small"
            variant="outlined"
          >
            Admin
          </Button>
        )}

        <IconButton component={Link} href="/cart" color="inherit" size="small">
          <Badge badgeContent={totalItems} color="secondary">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>

        {session ? (
          <>
            <IconButton onClick={handleMenuOpen} color="inherit" size="small">
              <AccountCircleIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled sx={{ opacity: '1 !important' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {session.user?.name}
                </Typography>
              </MenuItem>
              <MenuItem disabled sx={{ opacity: '1 !important', pt: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  {session.user?.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                component={Link}
                href="/orders"
                onClick={handleMenuClose}
              >
                My Orders
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
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
            disableElevation
          >
            Sign In
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
