import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [], // { product: {}, quantity: 1, eventId: '...' }

            addToCart: (product, eventId) => set((state) => {
                const existingItem = state.items.find(
                    item => item.product._id === product._id && item.eventId === eventId
                );

                if (existingItem) {
                    return {
                        items: state.items.map(item =>
                            item.product._id === product._id && item.eventId === eventId
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        )
                    };
                }

                return {
                    items: [...state.items, { product, quantity: 1, eventId }]
                };
            }),

            removeFromCart: (productId, eventId) => set((state) => ({
                items: state.items.filter(
                    item => !(item.product._id === productId && item.eventId === eventId)
                )
            })),

            updateQuantity: (productId, eventId, quantity) => set((state) => {
                if (quantity <= 0) {
                    return {
                        items: state.items.filter(
                            item => !(item.product._id === productId && item.eventId === eventId)
                        )
                    };
                }
                return {
                    items: state.items.map(item =>
                        item.product._id === productId && item.eventId === eventId
                            ? { ...item, quantity }
                            : item
                    )
                };
            }),

            clearCart: () => set({ items: [] }),

            getCartTotal: () => {
                const state = get();
                return state.items.reduce((total, item) => {
                    const priceToUse = item.product.discountPrice || item.product.actualPrice || 0;
                    return total + (priceToUse * item.quantity);
                }, 0);
            },

            getCartCount: () => {
                const state = get();
                return state.items.reduce((count, item) => count + item.quantity, 0);
            }
        }),
        {
            name: 'cart-storage',
        }
    )
);
