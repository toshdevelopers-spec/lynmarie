import { createContext, useContext, useState, useEffect } from 'react';
import { calculateCartTotal, calculateCartSubtotal, calculateCartSavings } from '../utils/formatPrice';
import { track } from '../services/tracking';

const CartContext = createContext(null);

/* eslint-disable react-refresh/only-export-components */

// Generate or retrieve guest ID
const getGuestId = () => {
  let guestId = localStorage.getItem('guest_cart_id');
  if (!guestId) {
    guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('guest_cart_id', guestId);
  }
  return guestId;
};

// Clear guest ID after merge
const clearGuestId = () => {
  localStorage.removeItem('guest_cart_id');
};

// Local cart storage (temporary until backend is configured)
const getLocalCart = () => {
  const cart = localStorage.getItem('local_cart');
  return cart ? JSON.parse(cart) : { items: [] };
};

const setLocalCart = (cart) => {
  localStorage.setItem('local_cart', JSON.stringify(cart));
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [guestId, setGuestId] = useState(null);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentGuestId = getGuestId();
      setGuestId(currentGuestId);
      
      // Load from local storage (temporary solution until backend is configured)
      const localCart = getLocalCart();
      setCart(localCart);
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Load cart on mount
  useEffect(() => {
    const timer = setTimeout(() => loadCart(), 0);
    return () => clearTimeout(timer);
  }, []);

  const addToCart = async (productId, quantity = 1, productData = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current cart
      const currentCart = getLocalCart();
      
      // Check if item already exists
      const existingItemIndex = currentCart.items.findIndex(
        item => item.product_id === productId
      );
      
      if (existingItemIndex > -1) {
        // Update quantity
        currentCart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item with unique key
        currentCart.items.push({
          key: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          product_id: productId,
          quantity,
          ...(productData || {})
        });
      }
      
      // Ensure all items have keys
      currentCart.items = currentCart.items.map(item => ({
        ...item,
        key: item.key || 'item_' + item.product_id + '_' + Math.random().toString(36).substr(2, 9)
      }));
      
      setLocalCart(currentCart);
      setCart(currentCart);
      track('ADD_TO_CART', { quantity }, productId);
      setIsCartOpen(true);
      return { success: true };
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (key, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentCart = getLocalCart();
      const itemIndex = currentCart.items.findIndex(item => item.key === key);
      
      if (itemIndex > -1) {
        if (quantity <= 0) {
          currentCart.items.splice(itemIndex, 1);
        } else {
          currentCart.items[itemIndex].quantity = quantity;
        }
      }
      
      setLocalCart(currentCart);
      setCart(currentCart);
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError('Failed to update cart item');
    } finally {
      setLoading(false);
    }
  };

  const removeCartItem = async (key) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentCart = getLocalCart();
      currentCart.items = currentCart.items.filter(item => item.key !== key);
      
      setLocalCart(currentCart);
      setCart(currentCart);
    } catch (err) {
      console.error('Error removing cart item:', err);
      setError('Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const emptyCart = { items: [] };
      setLocalCart(emptyCart);
      setCart(emptyCart);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    try {
      setLoading(true);
      setError(null);
      // Placeholder for coupon logic
      return { success: true };
    } catch (err) {
      console.error('Error applying coupon:', err);
      setError('Failed to apply coupon');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = async () => {
    try {
      setLoading(true);
      setError(null);
      // Placeholder for coupon removal
    } catch (err) {
      console.error('Error removing coupon:', err);
      setError('Failed to remove coupon');
    } finally {
      setLoading(false);
    }
  };

  // Merge guest cart with user cart after login
  const mergeGuestCart = async () => {
    if (!guestId) {
      return { success: true, message: 'No guest cart to merge' };
    }

    try {
      setLoading(true);
      setError(null);
      
      // Placeholder for backend merge - for now just clear guest ID
      // The backend will handle the actual merge when configured
      clearGuestId();
      setGuestId(null);
      
      return { success: true, message: 'Cart merge will be handled by backend' };
    } catch (err) {
      console.error('Error merging cart:', err);
      setError('Failed to merge cart');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Computed values
  const cartItems = cart?.items || [];
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = calculateCartTotal(cartItems);
  const cartSubtotal = calculateCartSubtotal(cartItems);
  const cartSavings = calculateCartSavings(cartItems);

  const value = {
    cart,
    cartItems,
    cartCount,
    cartTotal,
    cartSubtotal,
    cartSavings,
    loading,
    error,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    refreshCart: loadCart,
    mergeGuestCart,
    guestId,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
/* eslint-enable react-refresh/only-export-components */
