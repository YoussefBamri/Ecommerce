import React from 'react';
import { ShoppingBag, ArrowRight, Sparkles, Zap, Shield, Award } from 'lucide-react';
import '../styles/Hero.css';

export const Hero: React.FC = () => {
  return (
    <section className="hero-section">
      {/* Animated background elements */}
      <div className="hero-bg-elements">
        <div className="hero-bg-circle-1" />
        <div className="hero-bg-circle-2" />
        <div className="hero-bg-circle-3" />
        <div className="hero-bg-circle-4" />
        <div className="hero-bg-circle-large" />
        <div className="hero-bg-circle-small-1" />
        <div className="hero-bg-circle-small-2" />
        <div className="hero-bg-circle-left-large" />
        <div className="hero-bg-circle-left-medium" />
        <div className="hero-bg-circle-left-small" />
        <div className="hero-bg-circle-right-large" />
        <div className="hero-bg-circle-center" />
        <div className="hero-bg-triangle" />
        <div className="hero-bg-triangle-2" />
        <div className="hero-bg-triangle-small" />
        <div className="hero-bg-rectangle" />
        <div className="hero-bg-rectangle-2" />
        <div className="hero-bg-rectangle-large" />
        <div className="hero-bg-particles">
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
        </div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          {/* Badge */}
          <div className="hero-badge">
            <Sparkles className="hero-badge-icon" />
            <span className="hero-badge-text">Nouveau: Livraison express en 24h</span>
          </div>

          {/* Main heading */}
          <h1 className="hero-heading">
            L'excellence tech à
            <span className="hero-heading-gradient">
              portée de main
            </span>
          </h1>

          <p className="hero-description">
            Découvrez notre sélection premium de smartphones, ordinateurs et accessoires tech. Garantie 2 ans, livraison rapide partout en Tunisie.
          </p>

          {/* CTA buttons */}
          <div className="hero-cta-buttons">
            <a href="#shop" className="hero-btn-primary">
              <ShoppingBag className="hero-btn-primary-icon" />
              Explorer la boutique
              <ArrowRight className="hero-btn-primary-arrow" />
            </a>
            <a href="#promotions" className="hero-btn-secondary">
              Voir les promotions
            </a>
          </div>

          {/* Feature cards */}
          <div className="hero-features">
            {[
              { icon: <Zap />, title: "Livraison Express", desc: "En 24-48h partout en Tunisie" },
              { icon: <Shield />, title: "Paiement Sécurisé", desc: "Transactions 100% protégées" },
              { icon: <Award />, title: "Garantie 2 ans", desc: "SAV réactif et professionnel" },
            ].map((feature, i) => (
              <div key={i} className="hero-feature-card">
                <div className="hero-feature-icon">{feature.icon}</div>
                <h3 className="hero-feature-title">{feature.title}</h3>
                <p className="hero-feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="hero-wave">
        <svg viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,320L48,304C96,288,192,256,288,240C384,224,480,224,576,218.7C672,213,768,203,864,197.3C960,192,1056,192,1152,186.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="hsl(var(--background))"/>
          <path d="M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,218.7C672,224,768,224,864,213.3C960,203,1056,181,1152,176C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="hsl(var(--background))" opacity="0.3"/>
          <path d="M0,192L48,186.7C96,181,192,171,288,176C384,181,480,203,576,208C672,213,768,203,864,192C960,181,1056,171,1152,165.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="hsl(var(--background))" opacity="0.1"/>
        </svg>
      </div>
    </section>
  );
};
