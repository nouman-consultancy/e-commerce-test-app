import { create } from 'zustand';
import type { Cart, CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  setCart: (cart: Cart) => void;
  clear: () => void;
}

const useCartStore = create<CartStore>()((set) => ({
  items: [],
  totalItems: 0,
  totalPrice: 0,

  setCart: (cart: Cart) => {
    const items = cart.items ?? [];
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + Number(item.product?.price ?? 0) * item.quantity,
      0,
    );
    set({ items, totalItems, totalPrice });
  },

  clear: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
}));

export default useCartStore;
