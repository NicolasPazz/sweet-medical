import { act, renderHook } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

const turnoA = { id: 't1', costoEstimado: 1500 };
const turnoB = { id: 't2', costoEstimado: 2500 };

function createWrapper() {
  return function Wrapper({ children }) {
    return <CartProvider>{children}</CartProvider>;
  };
}

describe('useCart', () => {
  it('lanza error claro si se usa fuera de CartProvider', () => {
    expect(() => renderHook(() => useCart())).toThrow(
      'useCart debe usarse dentro de <CartProvider>',
    );
  });

  it('expone estado inicial y funciones dentro del provider', () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() });

    expect(result.current.items).toEqual([]);
    expect(result.current.summary).toEqual({
      count: 0,
      totalCost: 0,
      hasPendingCost: false,
    });
    expect(typeof result.current.addTurn).toBe('function');
    expect(typeof result.current.removeTurn).toBe('function');
    expect(typeof result.current.clearCart).toBe('function');
  });

  it('addTurn agrega un turno y no duplica por id', () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() });

    act(() => {
      result.current.addTurn(turnoA);
    });
    act(() => {
      result.current.addTurn(turnoA);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual(turnoA);
    expect(result.current.summary.count).toBe(1);
    expect(result.current.summary.totalCost).toBe(1500);
  });

  it('removeTurn elimina el turno por id', () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() });

    act(() => {
      result.current.addTurn(turnoA);
      result.current.addTurn(turnoB);
    });
    act(() => {
      result.current.removeTurn('t1');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('t2');
    expect(result.current.summary.count).toBe(1);
    expect(result.current.summary.totalCost).toBe(2500);
  });

  it('clearCart vacía el carrito', () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() });

    act(() => {
      result.current.addTurn(turnoA);
      result.current.addTurn(turnoB);
    });
    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.summary).toEqual({
      count: 0,
      totalCost: 0,
      hasPendingCost: false,
    });
  });

  it('calcula el costo total acumulado con costoEstimado', () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() });

    act(() => {
      result.current.addTurn(turnoA);
      result.current.addTurn(turnoB);
    });

    expect(result.current.summary.totalCost).toBe(4000);
    expect(result.current.summary.count).toBe(2);
    expect(result.current.summary.hasPendingCost).toBe(false);
  });

  it('marca hasPendingCost cuando costoEstimado no es válido', () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() });

    act(() => {
      result.current.addTurn({ id: 't3', costoEstimado: undefined });
      result.current.addTurn(turnoA);
    });

    expect(result.current.summary.hasPendingCost).toBe(true);
    expect(result.current.summary.totalCost).toBe(1500);
  });
});
