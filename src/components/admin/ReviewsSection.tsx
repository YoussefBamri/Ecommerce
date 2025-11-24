import React, { useState } from 'react';
import { ChevronDown, MessageSquare, Package, Star, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface Review {
  id: number;
  idProd: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Product {
  idProd: number;
  nom: string;
  image?: string;
  categorie?: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
  produits: Product[];
  onDeleteReview: (id: number) => Promise<void>;
  showDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  produits,
  onDeleteReview,
  showDeleteConfirm
}) => {
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());

  const handleDeleteReview = (reviewId: number) => {
    showDeleteConfirm(
      "Supprimer l'avis",
      "Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.",
      () => onDeleteReview(reviewId)
    );
  };

  return (
    <div className="admin-reviews-section animate-in fade-in-50 duration-500">
      <div className="admin-reviews-header">
        <h3 className="admin-section-title">Gestion des avis produits</h3>
        <p className="admin-section-subtitle">Consultez et gérez les avis laissés par les clients</p>
      </div>

      <div className="admin-reviews-content">
        {produits.map((product) => (
          <div key={product.idProd} className="admin-product-reviews-card">
            <div
              className="admin-product-header"
              onClick={() => {
                const newExpanded = new Set(expandedProducts);
                if (newExpanded.has(product.idProd)) {
                  newExpanded.delete(product.idProd);
                } else {
                  newExpanded.add(product.idProd);
                }
                setExpandedProducts(newExpanded);
              }}
            >
              <div className="admin-product-info">
                <img
                  src={product.image || '/placeholder.png'}
                  alt={product.nom}
                  className="admin-product-image"
                  onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                />
                <div>
                  <h4 className="admin-product-name">{product.nom}</h4>
                  <p className="admin-product-category">{product.categorie}</p>
                </div>
              </div>
              <div className="admin-product-toggle">
                <span className="admin-review-count">
                  {reviews.filter(r => r.idProd === product.idProd).length} avis
                </span>
                <ChevronDown
                  className={`admin-toggle-icon ${expandedProducts.has(product.idProd) ? 'rotated' : ''}`}
                />
              </div>
            </div>

            {expandedProducts.has(product.idProd) && (
              <div className="admin-reviews-list">
                {reviews
                  .filter(review => review.idProd === product.idProd)
                  .map((review) => (
                    <div key={review.id} className="admin-review-item">
                      <div className="admin-review-header">
                        <div className="admin-review-user">
                          <div className="admin-review-avatar">
                            {review.authorName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="admin-review-author">
                              {review.authorName || 'Utilisateur anonyme'}
                            </div>
                            <div className="admin-review-date">
                              {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                        <div className="admin-review-actions">
                          <div className="admin-review-rating">
                            {Array.from({ length: review.rating || 0 }).map((_, i) => (
                              <Star key={i} className="admin-star-filled" />
                            ))}
                            {Array.from({ length: 5 - (review.rating || 0) }).map((_, i) => (
                              <Star key={i} className="admin-star-empty" />
                            ))}
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                            className="admin-delete-review-btn"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="admin-review-content">
                        <p>{review.comment}</p>
                      </div>
                    </div>
                  ))}

                {reviews.filter(r => r.idProd === product.idProd).length === 0 && (
                  <div className="admin-no-reviews">
                    <MessageSquare className="admin-no-reviews-icon" />
                    <span>Aucun avis pour ce produit</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {produits.length === 0 && (
          <div className="admin-empty-state">
            <Package className="admin-empty-icon" />
            <span>Aucun produit disponible</span>
          </div>
        )}
      </div>
    </div>
  );
};