import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, ArrowRight } from 'lucide-react';
import { Produit } from '../types';
import { ProductCard } from './ProductCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { fetchProduits } from '../api/api';
import { mapBackendToFrontend } from '../utils/productMapper';
import '../styles/Promotions.css';

export const Promotions: React.FC<{ onViewDetails: (idProd: number) => void }> = ({ onViewDetails }) => {
  const [discountedProducts, setDiscountedProducts] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDiscountedProducts = async () => {
      try {
        setLoading(true);
        const backendProducts = await fetchProduits();
        const mappedProducts = backendProducts
          .map((product: any) => mapBackendToFrontend(product))
          .filter((p: Produit | null): p is Produit => p !== null && p.enSolde === true);

        setDiscountedProducts(mappedProducts.slice(0, 8)); // Show up to 8 discounted products
      } catch (error) {
        console.error('Error loading discounted products:', error);
        setDiscountedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadDiscountedProducts();
  }, []);

  if (loading) {
    return (
      <section className="promotions-section">
        <div className="promotions-container">
          <div className="text-center py-16">
            <p className="text-gray-500">Chargement des promotions...</p>
          </div>
        </div>
      </section>
    );
  }

  if (discountedProducts.length === 0) {
    return null; // Don't show the section if no discounted products
  }

  return (
    <section className="promotions-section">
      {/* Animated background elements */}
      <div className="promotions-bg-elements">
        <div className="promotions-bg-circle-1" />
        <div className="promotions-bg-circle-2" />
        <div className="promotions-bg-circle-3" />
        <div className="promotions-bg-circle-4" />
        <div className="promotions-bg-circle-large" />
        <div className="promotions-bg-circle-small-1" />
        <div className="promotions-bg-circle-small-2" />
        <div className="promotions-bg-circle-left-large" />
        <div className="promotions-bg-circle-left-medium" />
        <div className="promotions-bg-circle-left-small" />
        <div className="promotions-bg-circle-right-large" />
        <div className="promotions-bg-circle-center" />
        <div className="promotions-bg-triangle" />
        <div className="promotions-bg-triangle-2" />
        <div className="promotions-bg-triangle-small" />
        <div className="promotions-bg-rectangle" />
        <div className="promotions-bg-rectangle-2" />
        <div className="promotions-bg-rectangle-large" />
        <div className="promotions-bg-particles">
          <div className="promotions-particle" />
          <div className="promotions-particle" />
          <div className="promotions-particle" />
          <div className="promotions-particle" />
          <div className="promotions-particle" />
          <div className="promotions-particle" />
          <div className="promotions-particle" />
          <div className="promotions-particle" />
          <div className="promotions-particle" />
          <div className="promotions-particle" />
        </div>
      </div>

      <div className="promotions-container">
        <div className="promotions-content">
          {/* Badge */}
          <div className="promotions-badge">
            <Sparkles className="promotions-badge-icon" />
            <span className="promotions-badge-text">Promotions exceptionnelles</span>
          </div>

          {/* Main heading */}
          <h2 className="promotions-heading">
            Économisez jusqu'à
            <span className="promotions-heading-gradient">
              50% de réduction
            </span>
          </h2>

          <p className="promotions-description">
            Profitez de nos offres spéciales sur une sélection de produits high-tech. Offres limitées dans le temps !
          </p>

          {/* CTA button */}
          <div className="promotions-cta">
            <a href="#shop" className="promotions-btn-primary">
              <Tag className="promotions-btn-primary-icon" />
              Voir toutes les promotions
              <ArrowRight className="promotions-btn-primary-arrow" />
            </a>
          </div>

          {/* Products carousel */}
          <div className="promotions-products">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-6xl mx-auto"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {discountedProducts.map((product) => (
                  <CarouselItem key={product.idProd} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="p-1">
                      <ProductCard
                        produit={product}
                        onViewDetails={onViewDetails}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12 bg-white/90 hover:bg-white border-purple-200 text-purple-600 hover:text-purple-700" />
              <CarouselNext className="hidden md:flex -right-12 bg-white/90 hover:bg-white border-purple-200 text-purple-600 hover:text-purple-700" />
            </Carousel>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="promotions-wave">
        <svg viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,320L48,304C96,288,192,256,288,240C384,224,480,224,576,218.7C672,213,768,203,864,197.3C960,192,1056,192,1152,186.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="hsl(var(--background))"/>
          <path d="M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,218.7C672,224,768,224,864,213.3C960,203,1056,181,1152,176C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="hsl(var(--background))" opacity="0.3"/>
          <path d="M0,192L48,186.7C96,181,192,171,288,176C384,181,480,203,576,208C672,213,768,203,864,192C960,181,1056,171,1152,165.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="hsl(var(--background))" opacity="0.1"/>
        </svg>
      </div>
    </section>
  );
};