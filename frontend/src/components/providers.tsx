'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline, alpha } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { setAuthToken } from '@/lib/api';
import api from '@/lib/api';
import useCartStore from '@/store/cartStore';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
      dark: '#4f46e5',
      light: '#818cf8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f59e0b',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    divider: 'rgba(15,23,42,0.06)',
    error: { main: '#ef4444' },
    success: { main: '#22c55e' },
    warning: { main: '#f59e0b' },
    info: { main: '#6366f1' },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.04em' },
    h2: { fontWeight: 700, letterSpacing: '-0.03em' },
    h3: { fontWeight: 700, letterSpacing: '-0.025em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.015em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 600, letterSpacing: '0.01em' },
    button: { fontWeight: 600, letterSpacing: '-0.01em' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          boxShadow: '0 4px 14px rgba(99,102,241,0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
            transform: 'translateY(-1px)',
          },
          '&:active': { transform: 'translateY(0)' },
        },
        outlinedPrimary: {
          borderColor: alpha('#6366f1', 0.4),
          '&:hover': {
            borderColor: '#6366f1',
            bgcolor: alpha('#6366f1', 0.04),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
          border: '1px solid rgba(15,23,42,0.05)',
          borderRadius: 14,
          transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: 'rgba(15,23,42,0.08)',
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.7rem',
          letterSpacing: '0.01em',
        },
        colorPrimary: {
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: '#fff',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(15,23,42,0.12)',
            transition: 'border-color 0.2s',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(99,102,241,0.4)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.15s ease',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(15,23,42,0.06)' },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff',
          fontWeight: 700,
        },
      },
    },
  },
});

function SessionSync() {
  const { data: session } = useSession();
  useEffect(() => {
    setAuthToken(session?.user?.accessToken ?? null);
  }, [session]);
  return null;
}

function CartSync() {
  const { data: session, status } = useSession();
  const setCart = useCartStore((s) => s.setCart);
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    if (status === 'loading') return;
    if (session?.user?.accessToken) {
      api.get('/cart').then((res) => setCart(res.data)).catch(() => {});
    } else {
      clear();
    }
  }, [session, status, setCart, clear]);

  return null;
}

function InnerProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SessionSync />
        <CartSync />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              background: '#0f172a',
              color: '#f8fafc',
              fontSize: '0.875rem',
              fontWeight: 500,
              boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <InnerProviders>{children}</InnerProviders>
    </SessionProvider>
  );
}
