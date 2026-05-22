'use client';

import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';

export const ADD_TURN = 'ADD_TURN';
export const REMOVE_TURN = 'REMOVE_TURN';
export const CLEAR_CART = 'CLEAR_CART';

export const initialState = { items: [] };

/**
 * @param {{ costoEstimado?: number|null }} item
 * @returns {number|null} Monto finito o null si está pendiente
 */
export function resolveCostoEstimado(item) {
  const value = Number(item.costoEstimado);
  return Number.isFinite(value) ? value : null;
}

/**
 * @param {Array<{ costoEstimado?: number|null }>} items
 * @returns {{ count: number, totalCost: number, hasPendingCost: boolean }}
 */
export function buildCartSummary(items) {
  let totalCost = 0;
  let hasPendingCost = false;

  for (const item of items) {
    const cost = resolveCostoEstimado(item);
    if (cost === null) {
      hasPendingCost = true;
    } else {
      totalCost += cost;
    }
  }

  return {
    count: items.length,
    totalCost,
    hasPendingCost,
  };
}

/**
 * @param {typeof initialState} state
 * @param {{ type: string, payload?: unknown }} action
 */
export function cartReducer(state, action) {
  switch (action.type) {
    case ADD_TURN: {
      const turn = action.payload;
      if (state.items.some((item) => item.id === turn.id)) {
        return state;
      }
      return { items: [...state.items, turn] };
    }
    case REMOVE_TURN:
      return {
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case CLEAR_CART:
      return initialState;
    default:
      return state;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addTurn = useCallback((turn) => {
    dispatch({ type: ADD_TURN, payload: turn });
  }, []);

  const removeTurn = useCallback((id) => {
    dispatch({ type: REMOVE_TURN, payload: id });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: CLEAR_CART });
  }, []);

  const summary = useMemo(() => buildCartSummary(state.items), [state.items]);

  const value = useMemo(
    () => ({
      items: state.items,
      addTurn,
      removeTurn,
      clearCart,
      summary,
    }),
    [state.items, addTurn, removeTurn, clearCart, summary],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === null) {
    throw new Error('useCart debe usarse dentro de <CartProvider>');
  }
  return context;
}
