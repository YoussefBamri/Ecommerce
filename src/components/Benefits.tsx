import React from 'react';
import { Shield, Truck, CreditCard, Headphones, RefreshCw, Award } from 'lucide-react';
import '../styles/Benefits.css';

export const Benefits = () => {
  const benefits = [
    {
      icon: Shield,
      title: "Garantie Premium",
      description: "2 ans de garantie constructeur sur tous nos produits avec extension possible",
    },
    {
      icon: Truck,
      title: "Livraison Express",
      description: "Livraison en 24-48h partout en Tunisie avec suivi en temps réel",
    },
    {
      icon: CreditCard,
      title: "Paiement Flexible",
      description: "Paiement à la livraison, par carte ou en plusieurs fois sans frais",
    },
    {
      icon: Headphones,
      title: "Support 24/7",
      description: "Notre équipe d'experts est disponible à tout moment pour vous assister",
    },
    {
      icon: RefreshCw,
      title: "Retour Gratuit",
      description: "Satisfait ou remboursé sous 14 jours, retour gratuit sans condition",
    },
    {
      icon: Award,
      title: "Produits Authentiques",
      description: "100% authentiques et neufs, directement importés des marques officielles",
    },
  ];

  return (
    <section className="benefits-section">
      <div className="benefits-container">
        <div className="benefits-header">
          <h2 className="benefits-title">
            Pourquoi nous choisir ?
          </h2>
          <p className="benefits-subtitle">
            Une expérience d'achat premium du début à la fin
          </p>
        </div>

        <div className="benefits-grid">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="benefit-card"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="benefit-icon-bg">
                <benefit.icon className="benefit-icon" />
              </div>
              <h3 className="benefit-title">{benefit.title}</h3>
              <p className="benefit-description">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};