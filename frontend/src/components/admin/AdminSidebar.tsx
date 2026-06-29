'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';

export const DRAWER_WIDTH = 220;

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: DashboardIcon },
  { label: 'Products', href: '/admin/products', icon: InventoryIcon },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: '#0f172a',
          borderRight: 'none',
          boxShadow: '4px 0 30px rgba(0,0,0,0.2)',
        },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          px: 2.5,
          pt: 2.5,
          pb: 2,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.25 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.5)',
              flexShrink: 0,
            }}
          >
            <Typography sx={{ color: 'white', fontSize: '0.75rem', fontWeight: 800, lineHeight: 1 }}>
              S
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 800, color: 'white', letterSpacing: '-0.03em', fontSize: '1rem' }}>
            ShopApp
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', ml: 5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Admin
        </Typography>
      </Box>

      {/* Nav */}
      <List sx={{ pt: 2, px: 1.5, flexGrow: 1 }}>
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/admin/dashboard' && pathname.startsWith(href));
          return (
            <ListItem key={href} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                component={Link}
                href={href}
                sx={{
                  borderRadius: 1.5,
                  py: 1,
                  px: 1.5,
                  color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                  bgcolor: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                  '& .MuiListItemIcon-root': {
                    color: isActive ? '#818cf8' : 'rgba(255,255,255,0.4)',
                    minWidth: 34,
                  },
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.8)',
                    '& .MuiListItemIcon-root': { color: '#a5b4fc' },
                  },
                }}
              >
                <ListItemIcon>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 500,
                        color: 'inherit',
                      },
                    },
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: '#818cf8',
                      flexShrink: 0,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 1.5 }} />
      <Box sx={{ p: 1.5 }}>
        <ListItemButton
          component={Link}
          href="/products"
          sx={{
            borderRadius: 1.5,
            py: 1,
            px: 1.5,
            color: 'rgba(255,255,255,0.35)',
            '& .MuiListItemIcon-root': { color: 'rgba(255,255,255,0.3)', minWidth: 34 },
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.65)',
              '& .MuiListItemIcon-root': { color: 'rgba(255,255,255,0.5)' },
            },
          }}
        >
          <ListItemIcon>
            <StorefrontIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Back to Store"
            slotProps={{ primary: { sx: { fontSize: '0.8rem', fontWeight: 500, color: 'inherit' } } }}
          />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
