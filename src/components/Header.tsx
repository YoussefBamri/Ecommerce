import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Store, Shield, Search, Heart, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface HeaderProps {
  onNavigate: (page: string) => void;
  onSearch: (query: string) => void;
  currentPage: string;
  onViewDetails: (idProd: number) => void;
  onCheckout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage , onViewDetails , onCheckout}) => {
  const { getCartCount, cartItems, getCartTotal, removeFromCart, updateQuantity } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  useEffect(() => {
    const loadFavorites = () => {
      const favs = localStorage.getItem('favorites_v2');
      setFavorites(favs ? JSON.parse(favs) : []);
    };
    loadFavorites();
    window.addEventListener('favoritesUpdated', loadFavorites);
    return () => window.removeEventListener('favoritesUpdated', loadFavorites);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl">TechStore</span>
          </button>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex flex-1 justify-center">
            <nav className="flex items-center gap-2">
              <Button
                variant={currentPage === 'home' ? 'default' : 'ghost'}
                onClick={() => onNavigate('home')}
              >
                Accueil
              </Button>
              <Button
                variant={currentPage === 'order-tracking' ? 'default' : 'ghost'}
                onClick={() => onNavigate('order-tracking')}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                Suivre commande
              </Button>
              <Button
                variant={(currentPage === 'admin-login' || currentPage === 'admin-dashboard') ? 'default' : 'ghost'}
                onClick={() => onNavigate('admin-dashboard')}
                className="gap-2"
              >
                <Shield className="h-4 w-4" />
                Administration
              </Button>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            

            {/* Cart */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setCartOpen(!cartOpen)}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
              {cartOpen && (
                <div className="absolute left-0 top-full mt-2 w-[600px] max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Mon Panier</h3>
                      <Badge variant="secondary" className="text-xs">
                        {cartCount} article{cartCount > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                  {cartItems.length === 0 ? (
                    <div className="p-8 text-center">
                      <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500 font-medium">Votre panier est vide</p>
                      <p className="text-xs text-gray-400 mt-1">Ajoutez des produits à votre panier</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-2">
                        {cartItems.map((item) => (
                          <div
                            key={item.produit.idProd}
                            className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all duration-200 group"
                          >
                            <div className="relative">
                              <img
                                src={item.produit.image || '/placeholder.jpg'}
                                alt={item.produit.nom}
                                className="w-10 h-10 object-cover rounded-lg border border-gray-200 group-hover:border-blue-300 transition-colors"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate text-sm group-hover:text-blue-600 transition-colors">
                                {item.produit.nom || 'Produit'}
                              </p>
                              <p className="text-sm font-semibold text-blue-600 mt-0.5">
                                {item.produit.prix ? item.produit.prix.toFixed(2) : '0.00'} TND
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                                onClick={() => updateQuantity(item.produit.idProd, item.quantite - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">{item.quantite}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                                onClick={() => updateQuantity(item.produit.idProd, item.quantite + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={() => removeFromCart(item.produit.idProd)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-900">Total:</span>
                          <span className="font-bold text-blue-600">{cartTotal.toFixed(2)} TND</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => { onNavigate('cart'); setCartOpen(false); }}
                          >
                            Voir le panier
                          </Button>
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => { onCheckout(); setCartOpen(false); }}
                          >
                            Commander
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Favorites */}
            <div className="relative" style={{"width" : "150px"}}>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setFavoritesOpen(!favoritesOpen)}
              >
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {favorites.length}
                  </Badge>
                )}
              </Button>
              {favoritesOpen && (
                <div className="absolute right-0 top-full mt-2 w-[600px] max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Mes Favoris</h3>
                      <Badge variant="secondary" className="text-xs">
                        {favorites.length}
                      </Badge>
                    </div>
                  </div>
                  {favorites.length === 0 ? (
                    <div className="p-8 text-center">
                      <Heart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500 font-medium">Aucun favori pour le moment</p>
                      <p className="text-xs text-gray-400 mt-1">Ajoutez des produits à vos favoris</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-2">
                        {favorites.slice(0, 5).map((product: any) => (
                          <div
                            key={product.idProd}
                            onClick={() => {onViewDetails(product.idProd) ; setFavoritesOpen(false);}}
                            className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg cursor-pointer transition-all duration-200 group"
                          >
                            <div className="relative">
                              <img
                                src={product.image || '/placeholder.jpg'}
                                alt={product.nom}
                                className="w-10 h-10 object-cover rounded-lg border border-gray-200 group-hover:border-blue-300 transition-colors"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate text-sm group-hover:text-blue-600 transition-colors">
                                {product.nom || 'Produit'}
                              </p>
                              <p className="text-sm font-semibold text-blue-600 mt-0.5">
                                {product.prix ? product.prix.toFixed(2) : '0.00'} TND
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {favorites.length > 5 && (
                        <div className="p-3 text-center text-sm font-medium text-blue-600 border-t bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                          Voir tous les favoris ({favorites.length})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-2">
              <Button
                variant={currentPage === 'home' ? 'default' : 'ghost'}
                className="justify-start"
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                }}
              >
                Accueil
              </Button>
              <Button
                variant={currentPage === 'order-tracking' ? 'default' : 'ghost'}
                className="justify-start gap-2"
                onClick={() => {
                  onNavigate('order-tracking');
                  setMobileMenuOpen(false);
                }}
              >
                <Search className="h-4 w-4" />
                Suivre commande
              </Button>
              <Button
                variant={(currentPage === 'admin-login' || currentPage === 'admin-dashboard') ? 'default' : 'ghost'}
                className="justify-start gap-2"
                onClick={() => {
                  onNavigate('admin-dashboard');
                  setMobileMenuOpen(false);
                }}
              >
                <Shield className="h-4 w-4" />
                Administration
              </Button>
              <Button
                variant={currentPage === 'cart' ? 'default' : 'ghost'}
                className="justify-start"
                onClick={() => {
                  onNavigate('cart');
                  setMobileMenuOpen(false);
                }}
              >
                Panier ({cartCount})
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
