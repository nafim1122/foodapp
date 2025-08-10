import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cart, CartItem, MenuItem, Shop, MenuVariant, AddOn } from '@/types';

interface CartStore extends Cart {
  addItem: (menuItem: MenuItem, quantity?: number, variant?: MenuVariant, addOns?: AddOn[], specialInstructions?: string) => void;
  updateItemQuantity: (itemIndex: number, quantity: number) => void;
  removeItem: (itemIndex: number) => void;
  clearCart: () => void;
  setShop: (shop: Shop) => void;
  calculateTotals: () => void;
  canAddItem: (menuItem: MenuItem) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      shop: undefined,
      subtotal: 0,
      itemCount: 0,

      addItem: (menuItem, quantity = 1, variant, addOns = [], specialInstructions = '') => {
        const state = get();
        
        // Check if item can be added
        if (!state.canAddItem(menuItem)) {
          throw new Error('Cannot add items from different shops');
        }

        // Calculate item price
        let itemPrice = menuItem.price;
        if (variant) {
          itemPrice = variant.price;
        }

        // Add add-ons price
        const addOnPrice = addOns.reduce((total, addOn) => total + addOn.price, 0);
        const itemTotal = (itemPrice + addOnPrice) * quantity;

        // Check if item already exists (same variant and add-ons)
        const existingItemIndex = state.items.findIndex(item => 
          item.menuItem.id === menuItem.id &&
          JSON.stringify(item.variant) === JSON.stringify(variant) &&
          JSON.stringify(item.addOns) === JSON.stringify(addOns) &&
          item.specialInstructions === specialInstructions
        );

        let newItems;
        if (existingItemIndex >= 0) {
          // Update existing item
          newItems = [...state.items];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + quantity,
            itemTotal: (newItems[existingItemIndex].quantity + quantity) * (itemPrice + addOnPrice)
          };
        } else {
          // Add new item
          const newItem: CartItem = {
            menuItem,
            quantity,
            variant,
            addOns,
            specialInstructions,
            itemTotal
          };
          newItems = [...state.items, newItem];
        }

        set({ 
          items: newItems,
          shop: typeof menuItem.shop === 'object' ? menuItem.shop : state.shop
        });
        
        get().calculateTotals();
      },

      updateItemQuantity: (itemIndex, quantity) => {
        const state = get();
        if (quantity <= 0) {
          state.removeItem(itemIndex);
          return;
        }

        const newItems = [...state.items];
        const item = newItems[itemIndex];
        
        if (item) {
          const unitPrice = item.itemTotal / item.quantity;
          newItems[itemIndex] = {
            ...item,
            quantity,
            itemTotal: unitPrice * quantity
          };
          
          set({ items: newItems });
          get().calculateTotals();
        }
      },

      removeItem: (itemIndex) => {
        const state = get();
        const newItems = state.items.filter((_, index) => index !== itemIndex);
        
        set({ 
          items: newItems,
          shop: newItems.length === 0 ? undefined : state.shop
        });
        
        get().calculateTotals();
      },

      clearCart: () => {
        set({
          items: [],
          shop: undefined,
          subtotal: 0,
          itemCount: 0
        });
      },

      setShop: (shop) => {
        set({ shop });
      },

      calculateTotals: () => {
        const state = get();
        const subtotal = state.items.reduce((total, item) => total + item.itemTotal, 0);
        const itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
        
        set({ subtotal, itemCount });
      },

      canAddItem: (menuItem) => {
        const state = get();
        
        // If cart is empty, any item can be added
        if (state.items.length === 0) {
          return true;
        }

        // Check if item is from the same shop
        const currentShopId = state.shop?.id;
        const itemShopId = typeof menuItem.shop === 'object' ? menuItem.shop.id : menuItem.shop;
        
        return currentShopId === itemShopId;
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return a mock storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        items: state.items,
        shop: state.shop,
        subtotal: state.subtotal,
        itemCount: state.itemCount,
      }),
    }
  )
);
