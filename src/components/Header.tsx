import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Store, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface HeaderProps {
  onNavigate: (page: string) => void;
  onSearch: (query: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { getCartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = getCartCount();

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
                variant={currentPage === 'admin' ? 'default' : 'ghost'}
                onClick={() => onNavigate('admin')}
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
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => onNavigate('cart')}
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
                variant={currentPage === 'admin' ? 'default' : 'ghost'}
                className="justify-start gap-2"
                onClick={() => {
                  onNavigate('admin');
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
