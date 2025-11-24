import React, { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { getApprovedTestimonials } from '../api/api';
import '../styles/Testimonials.css';

export const Testimonials = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApprovedTestimonials();
  }, []);

  const loadApprovedTestimonials = async () => {
    try {
      const testimonialsData = await getApprovedTestimonials();
      setReviews(testimonialsData);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      // Fallback to static testimonials if API fails
      setReviews([
        {
          id: 1,
          authorName: "Mehdi Ben Ali",
          authorRole: "Client depuis 2 ans",
          comment: "Service impeccable ! J'ai acheté mon MacBook ici et la livraison était ultra rapide. Le SAV est vraiment réactif.",
          rating: 5,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          authorName: "Sarah Trabelsi",
          authorRole: "Cliente fidèle",
          comment: "Meilleur rapport qualité-prix du marché. Produits authentiques et garantie respectée. Je recommande à 100% !",
          rating: 5,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          authorName: "Karim Hamdi",
          authorRole: "Acheteur vérifié",
          comment: "Site sérieux et professionnel. Mon iPhone est arrivé en parfait état avec tous les accessoires. Excellent !",
          rating: 5,
          createdAt: new Date().toISOString()
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`testimonial-star ${i < rating ? 'filled' : ''}`}
      />
    ));
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">
            Ils nous font confiance
          </h2>
          <p className="testimonials-subtitle">
            Découvrez les avis de nos clients satisfaits
          </p>
        </div>

        <div className="testimonials-grid">
          {reviews.map((review, i) => (
            <div
              key={review.id || i}
              className="testimonial-card"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="testimonial-rating">
                {renderStars(review.rating)}
              </div>

              <p className="testimonial-comment">"{review.comment}"</p>

              <div className="testimonial-author">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.authorName}`}
                  alt={review.authorName}
                  className="testimonial-avatar"
                />
                <div className="testimonial-author-info">
                  <div className="testimonial-author-name">{review.authorName}</div>
                  <div className="testimonial-author-role">
                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};