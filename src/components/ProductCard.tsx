import React from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { Produit } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter } from './ui/card';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface ProductCardProps {
  produit: Produit;
  onViewDetails: (idProd: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ produit, onViewDetails }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(produit, 1);
    toast.success(`${produit.nom} ajouté au panier`, {
      description: `${produit.quantite || 1} article(s) ajouté(s)`,
    });
  };

  const isLowStock = produit.stock < 10;
  const isOutOfStock = produit.stock === 0;

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
      <div
        onClick={() => onViewDetails(produit.idProd)}
        className="relative overflow-hidden bg-gray-100"
      >
        <ImageWithFallback
          src={produit.image || ''}
          alt={produit.nom}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Rupture de stock
            </Badge>
          </div>
        )}
        
        {produit.enSolde && (
          <Badge variant="destructive" className="absolute top-3 right-3">
            -{produit.pourcentageSolde}%
          </Badge>
        )}
        
        {!isOutOfStock && !produit.enSolde && isLowStock && (
          <Badge variant="destructive" className="absolute top-3 right-3">
            Stock limité
          </Badge>
        )}
        
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(produit.idProd);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <p className="text-xs text-gray-500 mb-1">{produit.categorie}</p>
          <h3 className="line-clamp-2 min-h-[2.5rem]">{produit.nom}</h3>
        </div>
        
        <div className="flex items-baseline gap-2 mb-2">
          {produit.enSolde && produit.prixOriginal ? (
            <>
              <span className="text-2xl text-red-600">{produit.prix.toFixed(2)} TND</span>
              <span className="text-sm text-gray-400 line-through">{produit.prixOriginal.toFixed(2)} TND</span>
            </>
          ) : (
            <span className="text-2xl text-blue-600">{produit.prix.toFixed(2)} TND</span>
          )}
        </div>
        
        <p className="text-xs text-gray-600">
          {isOutOfStock ? 'Non disponible' : `${produit.stock} en stock`}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full gap-2"
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
