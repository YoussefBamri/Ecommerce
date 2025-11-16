import React from 'react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface CartProps {
  onContinueShopping: () => void;
  onCheckout: () => void;
}

export const Cart: React.FC<CartProps> = ({ onContinueShopping, onCheckout }) => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();

  const handleRemoveItem = (idProd: number, nom: string) => {
    removeFromCart(idProd);
    toast.success('Produit retiré du panier', {
      description: nom,
    });
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? (subtotal >= 50 ? 0 : 9.99) : 0;
  const tax = subtotal * 0.2; // TVA 20%
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-12 text-center">
            <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl mb-4">Votre panier est vide</h2>
            <p className="text-gray-600 mb-6">
              Découvrez nos produits et commencez vos achats !
            </p>
            <Button size="lg" onClick={onContinueShopping}>
              Découvrir nos produits
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Panier d'achat</h1>
          <p className="text-gray-600">{cartItems.length} article(s) dans votre panier</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.produit.idProd} className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <ImageWithFallback
                      src={item.produit.image || ''}
                      alt={item.produit.nom}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4 mb-2">
                      <div>
                        <h3 className="line-clamp-1 mb-1">{item.produit.nom}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {item.produit.categorie}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.produit.idProd, item.produit.nom)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.produit.idProd, item.quantite - 1)}
                          disabled={item.quantite <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 text-center">{item.quantite}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.produit.idProd, item.quantite + 1)}
                          disabled={item.quantite >= item.produit.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {item.produit.prix.toFixed(2)} TND / unité
                        </p>
                        <p className="text-lg text-blue-600">
                          {(item.produit.prix * item.quantite).toFixed(2)} TND
                        </p>
                      </div>
                    </div>

                    {/* Stock Warning */}
                    {item.quantite >= item.produit.stock && (
                      <p className="text-xs text-orange-600 mt-2">
                        Stock maximum atteint ({item.produit.stock} disponibles)
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            <Button variant="outline" onClick={onContinueShopping} className="w-full">
              Continuer mes achats
            </Button>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl mb-4">Récapitulatif</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span>{subtotal.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA (20%)</span>
                  <span>{tax.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  <span>
                    {shipping === 0 ? (
                      <Badge variant="secondary">Gratuite</Badge>
                    ) : (
                      `${shipping.toFixed(2)} TND`
                    )}
                  </span>
                </div>
                {subtotal < 50 && subtotal > 0 && (
                  <p className="text-xs text-gray-500">
                    Livraison gratuite à partir de 50 TND
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-xl">Total</span>
                <span className="text-2xl text-blue-600">{total.toFixed(2)} TND</span>
              </div>

              <Button size="lg" className="w-full gap-2" onClick={onCheckout}>
                Procéder au paiement
                <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="mt-6 space-y-2 text-xs text-gray-600">
                <p>✓ Paiement sécurisé</p>
                <p>✓ Livraison suivie</p>
                <p>✓ Retour gratuit sous 30 jours</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
