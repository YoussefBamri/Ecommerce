import React, { useState } from 'react';
import { Star, Send, MessageSquare } from 'lucide-react';
import { createTestimonial } from '../api/api';
import { toast } from 'sonner';
import '../styles/TestimonialForm.css';

export const TestimonialForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    authorName: '',
    rating: 5,
    comment: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.authorName.trim() || !formData.comment.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await createTestimonial({
        authorName: formData.authorName.trim(),
        rating: formData.rating,
        comment: formData.comment.trim(),
        authorRole: 'Utilisateur' // Default role
      });

      toast.success('Merci pour votre avis ! Il sera publié après validation.');
      setFormData({ authorName: '', rating: 5, comment: '' });
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast.error('Erreur lors de l\'envoi de votre avis');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`testimonial-form-star ${interactive ? 'interactive' : ''} ${
          i < rating ? 'filled' : ''
        }`}
        onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
      />
    ));
  };

  if (!isOpen) {
    return (
      <div className="testimonial-form-trigger">
        <button
          onClick={() => setIsOpen(true)}
          className="testimonial-form-button"
        >
          <MessageSquare className="testimonial-form-icon" />
          Donner mon avis sur le site
        </button>
      </div>
    );
  }

  return (
    <div className="testimonial-form-overlay" onClick={() => setIsOpen(false)}>
      <div className="testimonial-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="testimonial-form-header">
          <h3>Partagez votre expérience</h3>
          <p>Votre avis nous aide à améliorer notre service</p>
        </div>

        <form onSubmit={handleSubmit} className="testimonial-form-content">
          <div className="testimonial-form-group">
            <label className="testimonial-form-label">Votre nom</label>
            <input
              type="text"
              value={formData.authorName}
              onChange={(e) => setFormData({...formData, authorName: e.target.value})}
              className="testimonial-form-input"
              placeholder="Votre nom ou pseudonyme"
              required
            />
          </div>

          <div className="testimonial-form-group">
            <label className="testimonial-form-label">Note</label>
            <div className="testimonial-form-stars">
              {renderStars(formData.rating, true, (rating) => setFormData({...formData, rating}))}
            </div>
          </div>

          <div className="testimonial-form-group">
            <label className="testimonial-form-label">Votre avis</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
              className="testimonial-form-textarea"
              placeholder="Partagez votre expérience avec notre site et nos services..."
              rows={4}
              required
            />
          </div>

          <div className="testimonial-form-actions">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="testimonial-form-cancel"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="testimonial-form-submit"
            >
              {loading ? (
                'Envoi...'
              ) : (
                <>
                  <Send className="testimonial-form-submit-icon" />
                  Envoyer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};