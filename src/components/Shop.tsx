import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3x3, LayoutList, SlidersHorizontal, X, Eye, Star, ShoppingCart, GitCompare, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import CustomPriceSlider from "./CustomPriceSlider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { Produit } from "../types";
import { fetchProduits } from "../api/api";
import { useCart } from "../context/CartContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { mapBackendToFrontend } from "../utils/productMapper";
import "../styles/Shop.css";

type ViewMode = "grid-4" | "grid-2" | "list";
type ProductCardOrientation = "vertical" | "horizontal";

type ShopProps = {
  onNavigate?: (page: string) => void;
};

const Shop = ({ onNavigate }: ShopProps) => {
  const { addToCart } = useCart();
  const [viewMode, setViewMode] = useState<ViewMode>("grid-4");
  const [cardOrientation, setCardOrientation] = useState<ProductCardOrientation>("vertical");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);


  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Math.max(0, Math.min(priceRange[1] - 50, parseInt(e.target.value) || 0));
    setPriceRange([newVal, priceRange[1]]);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Math.max(priceRange[0] + 50, Math.min(1000, parseInt(e.target.value) || 0));
    setPriceRange([priceRange[0], newVal]);
  };

  const handleMinDecrease = () => {
    const newVal = Math.max(0, priceRange[0] - 50);
    setPriceRange([newVal, priceRange[1]]);
  };

  const handleMinIncrease = () => {
    const newVal = Math.min(priceRange[1] - 50, priceRange[0] + 50);
    setPriceRange([newVal, priceRange[1]]);
  };

  const handleMaxDecrease = () => {
    const newVal = Math.max(priceRange[0] + 50, priceRange[1] - 50);
    setPriceRange([priceRange[0], newVal]);
  };

  const handleMaxIncrease = () => {
    const newVal = Math.min(1000, priceRange[1] + 50);
    setPriceRange([priceRange[0], newVal]);
  };

  const [sortBy, setSortBy] = useState("featured");
  const [quickViewProduct, setQuickViewProduct] = useState<Produit | null>(null);
  const [products, setProducts] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonProducts, setComparisonProducts] = useState<Produit[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Load products from backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const backendProducts = await fetchProduits();
        const mappedProducts = backendProducts.map((product: any) => mapBackendToFrontend(product));
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error("Impossible de charger les produits");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [toast]);

  const categories = Array.from(new Set(products.map(p => p.categorie).filter((cat): cat is string => Boolean(cat))));

  const toggleCategory = (category: string) => {
    if (category === "All") {
      setSelectedCategories(["All"]);
    } else {
      const newCategories = selectedCategories.filter((c) => c !== "All");
      if (selectedCategories.includes(category)) {
        const filtered = newCategories.filter((c) => c !== category);
        setSelectedCategories(filtered.length === 0 ? ["All"] : filtered);
      } else {
        setSelectedCategories([...newCategories, category]);
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategories.includes("All") || selectedCategories.includes(product.categorie || "");
    const priceMatch = product.prix >= priceRange[0] && product.prix <= priceRange[1];
    return categoryMatch && priceMatch;
  });

  const FilterSidebar = () => (
    <div className="filter-sidebar">
      {/* Categories */}
      <div className="filter-section">
        <h3 className="filter-section h3">Categories</h3>
        <div className="category-list">
          <div key="All" className="category-item">
            <Checkbox
              id="All"
              checked={selectedCategories.includes("All")}
              onCheckedChange={() => toggleCategory("All")}
            />
            <label
              htmlFor="All"
              className="category-label"
            >
              Toutes les catégories
            </label>
          </div>
          {categories.map((category) => (
            <div key={category} className="category-item">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <label
                htmlFor={category}
                className="category-label"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <h3 className="filter-section h3">Prix</h3>
        <div className="price-controls">
          <CustomPriceSlider
            value={priceRange}
            onValueChange={setPriceRange}
            step={50}
          />
          <div className="price-inputs">
            <div className="price-control">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMinDecrease}
                className="price-btn"
                disabled={priceRange[0] <= 0}
              >
                -
              </Button>
              <input
                type="number"
                value={priceRange[0]}
                onChange={handleMinInputChange}
                step={50}
                className="price-input"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleMinIncrease}
                className="price-btn"
                disabled={priceRange[0] >= priceRange[1] - 50}
              >
                +
              </Button>
              <span className="price-unit">TND</span>
            </div>
            <div className="price-control">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMaxDecrease}
                className="price-btn"
                disabled={priceRange[1] <= priceRange[0] + 50}
              >
                -
              </Button>
              <input
                type="number"
                value={priceRange[1]}
                onChange={handleMaxInputChange}
                step={50}
                className="price-input"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleMaxIncrease}
                className="price-btn"
                disabled={priceRange[1] >= 1000}
              >
                +
              </Button>
              <span className="price-unit">TND</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        onClick={() => {
          setSelectedCategories(["All"]);
          setPriceRange([0, 1000]);
        }}
      >
        Réinitialiser les filtres
      </Button>
    </div>
  );

  const handleAddToCart = (product: Produit, quantity: number) => {
    addToCart(product, quantity);
    toast.success(`${product.nom} a été ajouté à votre panier.`);
    setQuickViewProduct(null);
  };

  const addToComparison = (product: Produit) => {
    if (comparisonProducts.length >= 4) {
      toast.error("Vous pouvez comparer maximum 4 produits");
      return;
    }
    if (comparisonProducts.find(p => p.idProd === product.idProd)) {
      toast.error("Ce produit est déjà dans la comparaison");
      return;
    }
    setComparisonProducts([...comparisonProducts, product]);
    toast.success(`${product.nom} ajouté à la comparaison`);
  };

  const removeFromComparison = (id: number) => {
    setComparisonProducts(comparisonProducts.filter(p => p.idProd !== id));
  };

  const clearComparison = () => {
    setComparisonProducts([]);
    setShowComparison(false);
  };

  const QuickViewModal = React.memo(() => {
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    useEffect(() => {
      if (quickViewProduct) {
        setSelectedQuantity(1);
      }
    }, [quickViewProduct]);

    if (!quickViewProduct) return null;

    return (
      <Dialog open={!!quickViewProduct} onOpenChange={() => setQuickViewProduct(null)} >
<DialogContent className="quick-view-dialog">

          <DialogHeader>
            <DialogTitle className="quick-view-header">Aperçu rapide</DialogTitle>
            <DialogDescription className="quick-view-description">Détails du produit et options</DialogDescription>
          </DialogHeader>

          <div className="quick-view-content">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="product-image-container"
            >
              <ImageWithFallback
                src={quickViewProduct.image || ''}
                alt={quickViewProduct.nom}
                className="product-image"
              />
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="product-info"
            >
              <div className="product-badges">
                <Badge variant="secondary" className="product-category-badge">
                  {quickViewProduct.categorie}
                </Badge>
                {quickViewProduct.enSolde && (
                  <Badge variant="destructive" className="product-sale-badge">
                    En solde
                  </Badge>
                )}
              </div>

              <h2 className="product-title">
                {quickViewProduct.nom}
              </h2>

              <div className="product-rating">
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`rating-star ${i < 4 ? '' : 'empty'}`}
                    />
                  ))}
                </div>
                <span className="rating-text">
                  4.5 sur 5
                </span>
              </div>

              <p className="product-description">
                {quickViewProduct.description || "Découvrez ce produit de qualité exceptionnelle."}
              </p>

              <div className="product-price-section">
                <div className="price-display">
                  {quickViewProduct.enSolde && quickViewProduct.prixOriginal ? (
                    <>
                      <p className="price-current">
                        {quickViewProduct.prix.toFixed(2)} TND
                      </p>
                      <p className="price-original">
                        {quickViewProduct.prixOriginal.toFixed(2)} TND
                      </p>
                    </>
                  ) : (
                    <p className="price-normal">
                      {quickViewProduct.prix.toFixed(2)} TND
                    </p>
                  )}
                </div>
                <p className="price-shipping">
                  Livraison gratuite dès 50 TND d'achat
                </p>
                {quickViewProduct.stock <= 5 && (
                  <div className="stock-indicator">
                    <Badge variant="destructive">Stock limité</Badge>
                  </div>
                )}
              </div>

              <div className="quantity-section">
                <div>
                  <label className="quantity-label">
                    Quantité
                  </label>
                  <div className="quantity-controls">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                    >
                      -
                    </Button>
                    <span className="quantity-display">
                      {selectedQuantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedQuantity(Math.min(selectedQuantity + 1, quickViewProduct.stock))}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <Button
                  onClick={() => handleAddToCart(quickViewProduct, selectedQuantity)}
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ajouter au panier
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    handleAddToCart(quickViewProduct, selectedQuantity);
                    onNavigate?.('cart');
                  }}
                >
                  Acheter maintenant
                </Button>
              </div>

              <div className="product-features">
                <p>✓ Retours gratuits sous 30 jours</p>
                <p>✓ Garantie 2 ans incluse</p>
                <p>✓ Expédition sous 24h</p>
              </div>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    );
  });

  const ComparisonModal = () => {
    if (comparisonProducts.length === 0) return null;

    return (
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="comparison-modal">
          <DialogHeader>
            <DialogTitle className="comparison-title">Product Comparison</DialogTitle>
            <DialogDescription>
              Compare {comparisonProducts.length} product{comparisonProducts.length !== 1 ? 's' : ''} side by side
            </DialogDescription>
          </DialogHeader>

          <div className="comparison-content">
            <div className="comparison-grid" style={{ gridTemplateColumns: `repeat(${comparisonProducts.length}, minmax(0, 1fr))` }}>
              {comparisonProducts.map((product, index) => (
                <motion.div
                  key={product.idProd}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="comparison-card"
                >
                  {/* Product Image */}
                  <div className="comparison-image-container">
                    <img
                      src={product.image || ''}
                      alt={product.nom}
                      className="comparison-image"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="comparison-remove-btn"
                      onClick={() => removeFromComparison(product.idProd)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Product Details */}
                  <div className="comparison-details">
                    <div>
                      <h3 className="comparison-product-title">{product.nom}</h3>
                      <div className="comparison-badges">
                        <Badge variant="secondary">{product.categorie}</Badge>
                      </div>
                    </div>

                    <div className="comparison-specs">
                      <div className="comparison-spec">
                        <span className="spec-label">Price</span>
                        <span className="spec-value">${product.prix}</span>
                      </div>
                      <div className="comparison-spec">
                        <span className="spec-label">Rating</span>
                        <div className="rating-display">
                          <Star className="rating-star filled" />
                          <span className="rating-number">4.5</span>
                        </div>
                      </div>
                      <div className="comparison-spec">
                        <span className="spec-label">Category</span>
                        <span className="spec-value">{product.categorie}</span>
                      </div>
                    </div>

                    <div className="comparison-actions">
                      <Button
                        className="comparison-add-cart-btn"
                        onClick={() => handleAddToCart(product, 1)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="comparison-footer">
              <Button variant="outline" onClick={clearComparison}>
                Clear All
              </Button>
              <p className="comparison-count">
                {comparisonProducts.length} of 4 products selected
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const ComparisonBar = () => {
    if (comparisonProducts.length === 0) return null;

    return (
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="comparison-bar"
      >
        <div className="comparison-bar-container">
          <div className="comparison-bar-left">
            <GitCompare className="comparison-icon" />
            <div>
              <h3 className="comparison-bar-title">Product Comparison</h3>
              <p className="comparison-bar-subtitle">
                {comparisonProducts.length} product{comparisonProducts.length !== 1 ? 's' : ''} selected
              </p>
            </div>  
          </div>

          <div className="comparison-bar-right">
            {/* Mini Product Previews */}
            <div className="comparison-previews">
              {comparisonProducts.map((product) => (
                <motion.div
                  key={product.idProd}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="comparison-preview"
                >
                  <div className="comparison-preview-image">
                    <img
                      src={product.image || ''}
                      alt={product.nom}
                      className="preview-image"
                    />
                  </div>
                  <button
                    onClick={() => removeFromComparison(product.idProd)}
                    className="preview-remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => setShowComparison(true)}
              className="comparison-compare-btn"
            >
              Compare Products
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={clearComparison}
              className="comparison-clear-btn"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  const ProductCard = ({ product }: { product: Produit }) => {
    const isHorizontal = cardOrientation === "horizontal";

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`product-card ${isHorizontal ? "product-card-horizontal" : "product-card-vertical"}`}
      >
        <div className={`product-image-container ${isHorizontal ? "product-image-container-horizontal" : "product-image-container-vertical"}`}>
          <ImageWithFallback
            src={product.image || ''}
            alt={product.nom}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="product-image-overlay">
            <div className="overlay-buttons">
              <Button
                size="sm"
                variant="secondary"
                className="overlay-button"
                onClick={() => setQuickViewProduct(product)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Aperçu rapide
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="overlay-button"
                onClick={() => addToComparison(product)}
              >
                <GitCompare className="h-4 w-4 mr-2" />
                Comparer
              </Button>
            </div>
          </div>
          {product.enSolde && (
            <Badge variant="destructive" className="product-sale-badge">
              -{product.pourcentageSolde}%
            </Badge>
          )}
        </div>
        <div className={`product-info ${isHorizontal ? "product-info-horizontal" : ""}`}>
          <div>
            <p className={isHorizontal ? "product-category" : "text-xs text-muted-foreground font-inter mb-1"}>{product.categorie}</p>
            <h3 className={isHorizontal ? "product-title" : "font-orbitron font-bold text-base mb-2 line-clamp-2"}>
              {product.nom}
            </h3>
            <div className={isHorizontal ? "product-rating" : "flex items-center gap-1 mb-2"}>
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${i < 4 ? "text-blue-500" : "text-muted"}`}
                >
                  ★
                </span>
              ))}
              <span className="text-xs text-muted-foreground ml-1">(4.5)</span>
            </div>
          </div>
          <div className={isHorizontal ? "product-price-section" : "flex items-center justify-between mt-auto"}>
            <div className="flex items-center gap-2">
              {product.enSolde && product.prixOriginal ? (
                <>
                  <p className={isHorizontal ? "product-price" : "font-orbitron font-bold text-xl text-red-600"}>{product.prix.toFixed(2)} TND</p>
                  <p className={isHorizontal ? "product-price-original" : "text-sm text-gray-400 line-through"}>{product.prixOriginal.toFixed(2)} TND</p>
                </>
              ) : (
                <p className={isHorizontal ? "product-price" : "font-orbitron font-bold text-xl text-blue-600"}>{product.prix.toFixed(2)} TND</p>
              )}
            </div>
            {isHorizontal && (
              <div className="flex flex-col items-start gap-1">
                {product.stock <= 5 && product.stock > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    Stock limité
                  </Badge>
                )}
                {product.stock <= 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Rupture de stock
                  </Badge>
                )}
                <Button
                  size="sm"
                  className="product-add-button"
                  onClick={() => handleAddToCart(product, 1)}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            )}
            {!isHorizontal && (
              <div className="flex flex-col items-end">
                {product.stock <= 5 && product.stock > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    Stock limité
                  </Badge>
                )}
                {product.stock <= 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Rupture de stock
                  </Badge>
                )}
                <Button
                  size="sm"
                  className="font-inter"
                  onClick={() => handleAddToCart(product, 1)}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="text-center py-16">
          <p className="text-gray-500">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <QuickViewModal />
      <ComparisonModal />
      <ComparisonBar />
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card border border-border rounded-xl p-6">
              <FilterSidebar />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filtres
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle className="font-orbitron">Filtres</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>
                <p className="text-sm text-muted-foreground font-inter">
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Card Orientation Toggle */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={cardOrientation === "vertical" ? "secondary" : "ghost"}
                    onClick={() => setCardOrientation("vertical")}
                    className="h-8 px-3"
                  >
                    Vertical
                  </Button>
                  <Button
                    size="sm"
                    variant={cardOrientation === "horizontal" ? "secondary" : "ghost"}
                    onClick={() => setCardOrientation("horizontal")}
                    className="h-8 px-3"
                  >
                    Horizontal
                  </Button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    size="icon"
                    variant={viewMode === "grid-4" ? "secondary" : "ghost"}
                    onClick={() => setViewMode("grid-4")}
                    className="h-8 w-8"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={viewMode === "grid-2" ? "secondary" : "ghost"}
                    onClick={() => setViewMode("grid-2")}
                    className="h-8 w-8"
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${viewMode}-${cardOrientation}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`grid gap-6 ${
                  viewMode === "grid-4"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 lg:grid-cols-2"
                }`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.idProd} product={product} />
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground font-inter text-lg">
                  Aucun produit ne correspond à vos filtres
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Shop;