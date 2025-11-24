import React from 'react';
import { Shield, CheckCircle, Lock, Truck } from 'lucide-react';
import '../styles/TrustBadges.css';

export const TrustBadges = () => {
  const badges = [
    { icon: Shield, text: "Paiement 100% sécurisé" },
    { icon: CheckCircle, text: "Produits certifiés" },
    { icon: Lock, text: "Données protégées" },
    { icon: Truck, text: "Livraison assurée" },
  ];

  return (
    <section className="trust-badges-section">
      <div className="trust-badges-container">
        <div className="trust-badges-flex">
          {badges.map((badge, i) => (
            <div
              key={i}
              className="trust-badge-item"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="trust-badge-icon-bg">
                <badge.icon className="trust-badge-icon" />
              </div>
              <span className="trust-badge-text">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};