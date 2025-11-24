import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Minus, Plus, Package, Truck, Shield, Star, User, MessageSquare } from 'lucide-react';
import { Produit } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { getReviewsByProduct, getProductReviewStats, createReview } from '../api/api';
import '../styles/ProductReviews.css';

interface ProductDetailProps {
  produit: Produit;
  onBack: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ produit, onBack }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, reviewCount: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    authorName: '',
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(false);

  const handleAddToCart = () => {
    addToCart(produit, quantity);
    toast.success('Produit ajouté au panier', {
      description: `${quantity} × ${produit.nom}`,
    });
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= produit.stock) {
      setQuantity(newQuantity);
    }
  };

  const isOutOfStock = produit.stock === 0;
  const isLowStock = produit.stock < 10;
  const totalPrice = produit.prix * quantity;

  // Load reviews when component mounts
  useEffect(() => {
    loadReviews();
  }, [produit.idProd]);

  const loadReviews = async () => {
    try {
      const [reviewsData, statsData] = await Promise.all([
        getReviewsByProduct(produit.idProd),
        getProductReviewStats(produit.idProd)
      ]);
      setReviews(reviewsData);
      setReviewStats(statsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.authorName.trim() || !newReview.comment.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await createReview({
        idProd: produit.idProd,
        authorName: newReview.authorName.trim(),
        rating: newReview.rating,
        comment: newReview.comment.trim()
      });

      toast.success('Avis ajouté avec succès !');
      setNewReview({ authorName: '', rating: 5, comment: '' });
      setShowReviewForm(false);
      loadReviews(); // Reload reviews
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Erreur lors de l\'ajout de l\'avis');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${interactive ? 'cursor-pointer' : ''} ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
        onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux produits
        </Button>

        {/* Product Detail */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <div className="relative">
            <Card className="overflow-hidden">
              <div className="relative bg-gray-100">
                <ImageWithFallback
                  src={produit.image || ''}
                  alt={produit.nom}
                  className="w-full h-[500px] object-cover"
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant="destructive" className="text-xl px-6 py-3">
                      Rupture de stock
                    </Badge>
                  </div>
                )}
              </div>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <Card className="p-4 text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-xs">Livraison gratuite</p>
              </Card>
              <Card className="p-4 text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-xs">Garantie 2 ans</p>
              </Card>
              <Card className="p-4 text-center">
                <Package className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-xs">Retour 30 jours</p>
              </Card>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Category */}
            <div>
              <Badge variant="secondary" className="mb-3">
                {produit.categorie}
              </Badge>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl mb-2">{produit.nom}</h1>
              <div className="flex gap-2">
                {produit.enSolde && (
                  <Badge variant="destructive" className="text-sm">
                    Solde -{produit.pourcentageSolde}%
                  </Badge>
                )}
                {!isOutOfStock && isLowStock && (
                  <Badge variant="destructive">
                    Plus que {produit.stock} en stock !
                  </Badge>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              {produit.enSolde && produit.prixOriginal ? (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl text-red-600">{produit.prix.toFixed(2)} TND</span>
                    <span className="text-sm text-gray-500">TTC</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl text-gray-400 line-through">{produit.prixOriginal.toFixed(2)} TND</span>
                    <span className="text-sm text-green-600">
                      Économisez {(produit.prixOriginal - produit.prix).toFixed(2)} TND
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl text-blue-600">{produit.prix.toFixed(2)} TND</span>
                  <span className="text-sm text-gray-500">TTC</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {produit.description || 'Aucune description disponible pour ce produit.'}
              </p>
            </div>

            <Separator />

            {/* Stock Info */}
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-500" />
              <span className="text-sm">
                {isOutOfStock ? (
                  <span className="text-red-600">Rupture de stock</span>
                ) : (
                  <span className="text-green-600">{produit.stock} articles disponibles</span>
                )}
              </span>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Quantité</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= produit.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Total */}
                <Card className="p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Prix unitaire:</span>
                    <span>{produit.prix.toFixed(2)} TND</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total:</span>
                    <span className="text-2xl text-blue-600">{totalPrice.toFixed(2)} TND</span>
                  </div>
                </Card>

                {/* Add to Cart Button */}
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Ajouter au panier
                </Button>
              </div>
            )}

            {isOutOfStock && (
              <Card className="p-4 bg-red-50 border-red-200">
                <p className="text-red-800 text-center">
                  Ce produit n'est actuellement pas disponible. Revenez plus tard !
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <Card className="mt-12 p-6">
          <h2 className="text-2xl mb-4">Informations complémentaires</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="mb-2">Livraison</h3>
              <p className="text-sm text-gray-600">
                Livraison gratuite en France métropolitaine. Délai de 2-3 jours ouvrés.
              </p>
            </div>
            <div>
              <h3 className="mb-2">Retours</h3>
              <p className="text-sm text-gray-600">
                Satisfait ou remboursé pendant 30 jours. Retour gratuit.
              </p>
            </div>
            <div>
              <h3 className="mb-2">Garantie</h3>
              <p className="text-sm text-gray-600">
                Tous nos produits sont garantis 2 ans pièces et main d'œuvre.
              </p>
            </div>
          </div>
        </Card>

        {/* Reviews Section */}
        <Card className="mt-8 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl mb-2">Avis clients</h2>
              {reviewStats.reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(Math.round(reviewStats.averageRating))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {reviewStats.averageRating.toFixed(1)} ({reviewStats.reviewCount} avis)
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Écrire un avis
            </Button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <Card className="mb-6 p-4 bg-gray-50">
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Votre nom</label>
                    <input
                      type="text"
                      value={newReview.authorName}
                      onChange={(e) => setNewReview({...newReview, authorName: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Note</label>
                    <div className="flex items-center gap-1">
                      {renderStars(newReview.rating, true, (rating) => setNewReview({...newReview, rating}))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2">Votre avis</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    className="w-full p-2 border rounded-md h-24 resize-none"
                    placeholder="Partagez votre expérience avec ce produit..."
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Envoi...' : 'Publier l\'avis'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <Card key={review.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.authorName}</span>
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Soyez le premier à donner votre avis sur ce produit !</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
