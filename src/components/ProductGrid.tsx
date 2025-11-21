import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Produit } from '../types';
import { ProductCard } from './ProductCard';
import { Button } from './ui/button';

interface ProductGridProps {
  produits: Produit[];
  onViewDetails: (idProd: number) => void;
  searchQuery?: string;
  selectedCategory?: string | null;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  produits, 
  onViewDetails,
  searchQuery = '',
  selectedCategory = null
}) => {
  const filteredProducts = useMemo(() => {
    let filtered = produits;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categorie?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.categorie === selectedCategory);
    }

    return filtered;
  }, [produits, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Results count */}
      {searchQuery && (
        <div className="text-sm text-gray-600">
          {filteredProducts.length} résultat(s) pour "{searchQuery}"
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Aucun produit trouvé</p>
          {searchQuery && (
            <Button variant="outline" onClick={() => window.location.reload()}>
              Réinitialiser la recherche
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((produit, index) => (
            <motion.div
              key={produit.idProd}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard
                produit={produit}
                onViewDetails={onViewDetails}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
