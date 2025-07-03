import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  addItem: (item) => {
    const items = get().items;
    const existingItem = items.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      items.push(item);
    }
    set((state) => ({
      ...state,
      items,
      totalQuantity: state.totalQuantity + item.quantity,
      totalPrice: state.totalPrice + item.price * item.quantity,
    }));
  },
  removeItem: (id) => {
    set((state) => {
      const items = state.items.filter((item) => item.id !== id);
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { items, totalQuantity, totalPrice };
    });
  },
  updateItemQuantity: (id, quantity) => {
    set((state) => {
      const items = state.items.map((item) => {
        if (item.id === id) {
          item.quantity = quantity;
        }
        return item;
      });
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { items, totalQuantity, totalPrice };
    });
  },
  clearCart: () => set({ items: [], totalQuantity: 0, totalPrice: 0 }),
}));

