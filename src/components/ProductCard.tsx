import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Heart, Tag, AlertTriangle } from 'lucide-react';
import { Produit } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter } from './ui/card';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

interface ProductCardProps {
  produit: Produit;
  onViewDetails: (idProd: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ produit, onViewDetails }) => {
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState<number[]>([]);

  // Get favorites from localStorage
  const getFavorites = () => {
    const favorites = localStorage.getItem('favorites_v2');
    return favorites ? JSON.parse(favorites) : [];
  };

  useEffect(() => {
    setFavorites(getFavorites());
    const handleFavoritesUpdate = () => setFavorites(getFavorites());
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
  }, []);

  // Check if product is favorited
  const isFavorited = favorites.some((fav: any) => fav.idProd === produit.idProd);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(produit, 1);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentFavorites = getFavorites();
    let newFavorites;

    if (isFavorited) {
      newFavorites = currentFavorites.filter((fav: any) => fav.idProd !== produit.idProd);
      toast.success('Retiré des favoris', { description: produit.nom });
    } else {
      newFavorites = [...currentFavorites, produit];
      toast.success('Ajouté aux favoris', { description: produit.nom });
    }

    localStorage.setItem('favorites_v2', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const isLowStock = produit.stock < 10;
  const isOutOfStock = produit.stock === 0;

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 rounded-xl border-2 border-gray-100 hover:border-blue-200">
      <div
        onClick={() => onViewDetails(produit.idProd)}
        className="relative overflow-hidden bg-gray-100"
      >
        <ImageWithFallback
          src={produit.image || ''}
          alt={produit.nom}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Rupture de stock
            </Badge>
          </div>
        )}

        {produit.enSolde && (
          <Badge variant="destructive" className="absolute top-3 right-3 flex items-center gap-1">
            <Tag className="h-3 w-3" />
            -{produit.pourcentageSolde}%
          </Badge>
        )}

        {!isOutOfStock && !produit.enSolde && isLowStock && (
          <Badge variant="destructive" className="absolute top-3 right-3 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Stock limité
          </Badge>
        )}

        <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onViewDetails(produit.idProd);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className={`h-8 w-8 ${isFavorited ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={handleToggleFavorite}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-blue-600 text-blue-600' : 'text-gray-600'}`} />
          </Button>
          {!isOutOfStock && (
            <Button
              size="icon"
              className="h-8 w-8 bg-blue-600 hover:bg-blue-700"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleAddToCart(e);
              }}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <p className="text-xs text-gray-500 mb-1">{produit.categorie}</p>
          <h3 className="line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">{produit.nom}</h3>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          {produit.enSolde && produit.prixOriginal ? (
            <>
              <span className="text-2xl font-bold text-red-600">{produit.prix.toFixed(2)}</span>
              <span className="text-sm text-gray-400 line-through">{produit.prixOriginal.toFixed(2)}</span>
              <span className="text-sm text-gray-500 ml-1">TND</span>
            </>
          ) : (
            <>
              <span className="text-2xl font-bold text-blue-600">{produit.prix.toFixed(2)}</span>
              <span className="text-sm text-gray-500 ml-1">TND</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isOutOfStock ? (
            <span className="text-xs text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Non disponible
            </span>
          ) : (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {produit.stock} en stock
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="h-4 w-4" />
          Ajouter au panier
        </Button>
      </CardFooter>
    </Card>
  );
};
