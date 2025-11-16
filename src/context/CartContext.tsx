import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Produit } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (produit: Produit, quantite?: number) => void;
  removeFromCart: (idProd: number) => void;
  updateQuantity: (idProd: number, quantite: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Vider le panier au démarrage pour supprimer les produits statiques
    // Ceci est une migration unique pour nettoyer les anciens produits statiques
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // Vérifier si c'est une ancienne version avec produits statiques
        // On vide le panier pour repartir à zéro avec les produits dynamiques
        console.log('🧹 Nettoyage du panier - suppression des produits statiques');
        localStorage.removeItem('cart');
        return [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    // Sauvegarder seulement si le panier n'est pas vide
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      // Supprimer le localStorage si le panier est vide
      localStorage.removeItem('cart');
    }
  }, [cartItems]);

  const addToCart = (produit: Produit, quantite: number = 1) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.produit.idProd === produit.idProd);
      
      if (existingItem) {
        return prev.map((item) =>
          item.produit.idProd === produit.idProd
            ? { ...item, quantite: Math.min(item.quantite + quantite, produit.stock) }
            : item
        );
      }
      
      return [...prev, { produit, quantite: Math.min(quantite, produit.stock) }];
    });
  };

  const removeFromCart = (idProd: number) => {
    setCartItems((prev) => prev.filter((item) => item.produit.idProd !== idProd));
  };

  const updateQuantity = (idProd: number, quantite: number) => {
    if (quantite <= 0) {
      removeFromCart(idProd);
      return;
    }
    
    setCartItems((prev) =>
      prev.map((item) =>
        item.produit.idProd === idProd
          ? { ...item, quantite: Math.min(quantite, item.produit.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.produit.prix * item.quantite, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantite, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
