'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { setAuthToken } from '@/lib/api';
import api from '@/lib/api';
import useCartStore from '@/store/cartStore';

const theme = createTheme({
  palette: {
    primary: { main: '#1a1a2e' },
    secondary: { main: '#e94560' },
    background: { default: '#f8f9fa' },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), Arial, sans-serif',
  },
  shape: { borderRadius: 8 },
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
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
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
