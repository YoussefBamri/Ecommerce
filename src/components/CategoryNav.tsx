import React from 'react';
import { Button } from './ui/button';

interface CategoryNavProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="bg-white border-b sticky top-16 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-4 overflow-x-auto">
          <Button
            variant={selectedCategory === null ? 'default' : 'ghost'}
            onClick={() => onSelectCategory(null)}
            className="flex-shrink-0"
          >
            Nouveaux produits
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'ghost'}
              onClick={() => onSelectCategory(category)}
              className="flex-shrink-0 capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
