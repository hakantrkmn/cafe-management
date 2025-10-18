import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface PopularProduct {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  addedAt: number;
}

interface PopularProductsState {
  popularProducts: PopularProduct[];
  addPopularProduct: (product: Omit<PopularProduct, "addedAt">) => void;
  removePopularProduct: (productId: string) => void;
  isPopular: (productId: string) => boolean;
  clearAllPopularProducts: () => void;
}

export const usePopularProductsStore = create<PopularProductsState>()(
  persist(
    (set, get) => ({
      popularProducts: [],

      addPopularProduct: (product) => {
        set((state) => {
          const newProduct: PopularProduct = {
            ...product,
            addedAt: Date.now(),
          };

          // Eğer ürün zaten varsa, sadece zaman damgasını güncelle
          const existingIndex = state.popularProducts.findIndex(
            (p) => p.id === product.id
          );
          let updated;

          if (existingIndex >= 0) {
            updated = [...state.popularProducts];
            updated[existingIndex] = newProduct;
          } else {
            // Maksimum 20 popüler ürün tut
            updated = [newProduct, ...state.popularProducts].slice(0, 20);
          }

          return { popularProducts: updated };
        });
      },

      removePopularProduct: (productId) => {
        set((state) => ({
          popularProducts: state.popularProducts.filter(
            (p) => p.id !== productId
          ),
        }));
      },

      isPopular: (productId) => {
        return get().popularProducts.some((p) => p.id === productId);
      },

      clearAllPopularProducts: () => {
        set({ popularProducts: [] });
      },
    }),
    {
      name: "cafe-popular-products",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
