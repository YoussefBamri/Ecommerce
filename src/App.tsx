import React, { useState, useMemo, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { StripeProvider } from './context/StripeContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Promotions } from './components/Promotions';
import { TrustBadges } from './components/TrustBadges';
import { Testimonials } from './components/Testimonials';
import { Benefits } from './components/Benefits';
import { TestimonialForm } from './components/TestimonialForm';
import { ProductGrid } from './components/ProductGrid';
import { CategoryNav } from './components/CategoryNav';
import { ProductDetail } from './components/ProductDetail';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { OrderConfirmation } from './components/OrderConfirmation';
import { PaymentSuccess } from './components/PaymentSuccess';
import { OrderTracking } from './components/OrderTracking';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import Shop from './components/Shop';
import { Client, Produit } from './types';
import { Toaster } from './components/ui/sonner';
import { fetchProduits, getProduitById } from './api/api';
import { Button } from './components/ui/button';
import { mapBackendToFrontend } from './utils/productMapper';

type Page = 'home' | 'shop' | 'product-detail' | 'cart' | 'checkout' | 'order-confirmation' | 'payment-success' | 'order-tracking' | 'admin-login' | 'admin-dashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProduct, setSelectedProduct] = useState<Produit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<{ client: Client; orderId: number } | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<number | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [products, setProducts] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);


  // Check admin authentication on mount
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  // Function to load products from backend
  const loadProducts = async (showLoading = true, preserveExisting = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      console.log('🔄 Chargement des produits depuis le backend...');
      const backendProducts = await fetchProduits();
      console.log('✅ Produits reçus du backend:', backendProducts);
      
      if (!backendProducts || !Array.isArray(backendProducts)) {
        console.error('❌ Les produits ne sont pas un tableau:', backendProducts);
        throw new Error('Format de données invalide');
      }
      
      if (backendProducts.length === 0) {
        console.warn('⚠️ Aucun produit dans le backend');
        // Ne pas écraser les produits existants si preserveExisting est true
        if (!preserveExisting) {
          setProducts([]);
          localStorage.removeItem('products');
        }
      } else {
        // Map products and filter out any that fail to map
        const mappedProducts = backendProducts
          .map((product: any, index: number) => {
            try {
              return mapBackendToFrontend(product);
            } catch (error) {
              console.error(`❌ Erreur lors du mapping du produit ${index}:`, error, product);
              return null;
            }
          })
          .filter((p: Produit | null): p is Produit => p !== null);
        
        console.log('✅ Produits mappés avec succès:', mappedProducts.length, 'sur', backendProducts.length);
        setProducts(mappedProducts);
        // Save to localStorage for caching
        localStorage.setItem('products', JSON.stringify(mappedProducts));
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des produits:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Fallback to localStorage if available - NE PAS écraser si preserveExisting est true
      if (!preserveExisting) {
        const savedProducts = localStorage.getItem('products');
        if (savedProducts) {
          try {
            const parsed = JSON.parse(savedProducts);
            console.log('📦 Utilisation des produits en cache:', parsed);
            setProducts(parsed);
          } catch (parseError) {
            console.error('❌ Erreur lors du parsing des produits en cache:', parseError);
            setProducts([]);
          }
        } else {
          setProducts([]);
        }
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Load products from backend on mount - charger directement depuis le backend
  useEffect(() => {
    // Charger directement depuis le backend au démarrage
    loadProducts(true, false);
  }, []);

  // Handle URL-based routing for payment success
  useEffect(() => {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);

    if (path === '/payment-success' && urlParams.get('session_id')) {
      setCurrentPage('payment-success');
    }
  }, []);


  // Get all categories and their product counts
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.categorie).filter((cat): cat is string => Boolean(cat)));
    return Array.from(cats).sort();
  }, [products]); // ✅ dépend de products
  
  const productCounts = useMemo(() => {
    const counts: { [key: string]: number } = {
      new: Math.min(8, products.length),
    };
    products.forEach(p => {
      const cat = p.categorie || 'Autres';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]); // ✅
  
  const newProducts = useMemo(() => {
    return products.slice(0, 8);
  }, [products]); // ✅
  

  const handleNavigate = (page: string) => {
    if (page === 'home') {
      setCurrentPage('home');
      setSelectedProduct(null);
      setSearchQuery('');
      setSelectedCategory(null);
      // Recharger les produits en arrière-plan (sans écran de chargement)
      // pour éviter de faire disparaître les produits (preserveExisting = true)
      loadProducts(false, true);
    } else if (page === 'shop') {
      setCurrentPage('shop');
    } else if (page === 'cart') {
      setCurrentPage('cart');
    } else if (page === 'order-tracking') {
      setCurrentPage('order-tracking');
      setTrackingOrderId(null); // Reset for new tracking session
    } else if (page === 'admin-login') {
      setCurrentPage('admin-login');
    } else if (page === 'admin-dashboard') {
      // Check if authenticated before allowing access
      const adminAuth = localStorage.getItem('adminAuth');
      if (adminAuth === 'true') {
        setCurrentPage('admin-dashboard');
      } else {
        setCurrentPage('admin-login');
      }
    }
  };

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setCurrentPage('admin-dashboard');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setCurrentPage('admin-login');
      // Recharger les produits après la déconnexion admin pour refléter les changements
      // Mais ne pas afficher de loading pour éviter de faire disparaître les produits
      loadProducts(false, true);
  };

  const handleViewProductDetail = async (idProd: number) => {
    try {
      // Try to get product from backend
      const backendProduct = await getProduitById(idProd);
      const mappedProduct = mapBackendToFrontend(backendProduct);
      setSelectedProduct(mappedProduct);
      setCurrentPage('product-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error loading product details:', error);
      // Fallback to local products
      const product = products.find(p => p.idProd === idProd);
      if (product) {
        setSelectedProduct(product);
        setCurrentPage('product-detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedProduct(null);
    setSelectedCategory(null);
      // Recharger les produits en arrière-plan sans écran de chargement (preserveExisting = true)
      loadProducts(false, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCart = () => {
    setCurrentPage('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckout = () => {
    setCurrentPage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderComplete = (client: Client, orderId: number) => {
    setOrderData({ client, orderId });
    setCurrentPage('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewOrderTracking = (orderId: number) => {
    setTrackingOrderId(orderId);
    setCurrentPage('order-tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <StripeProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
        {currentPage !== 'admin-login' && currentPage !== 'admin-dashboard' && (
          <Header
            onNavigate={handleNavigate}
            onSearch={handleSearch}
            currentPage={currentPage}
            onViewDetails={handleViewProductDetail}
            onCheckout={handleCheckout}
          />
        )}

        {currentPage === 'home' && (
          <>
            {!searchQuery && !selectedCategory && <Hero />}
            {!searchQuery && !selectedCategory && <Promotions onViewDetails={handleViewProductDetail} />}
            <CategoryNav
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />
            <div className="container mx-auto px-4 py-12">
              <div className="mb-8">
                {searchQuery ? (
                  <h2 className="text-2xl">Résultats de recherche</h2>
                ) : selectedCategory ? (
                  <>
                    <h2 className="text-3xl mb-2 capitalize">{selectedCategory}</h2>
                    <p className="text-gray-600">
                      Découvrez nos produits {selectedCategory}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl mb-2">Nouveaux produits</h2>
                    <p className="text-gray-600">
                          Découvrez nos dernières nouveautés
                    </p>
                  </>
                )}
              </div>
              {loading ? (
                <div className="text-center py-16">
                  <p className="text-gray-500">Chargement des produits...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 mb-4">Aucun produit disponible</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Vérifiez que le backend est démarré sur http://localhost:8081
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => loadProducts()}
                  >
                    Réessayer
                  </Button>
                </div>
              ) : (
                <ProductGrid
                  produits={selectedCategory ? products : newProducts}
                  onViewDetails={handleViewProductDetail}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                />
              )}
            </div>
            {!searchQuery && !selectedCategory && <Benefits />}
            {!searchQuery && !selectedCategory && <TrustBadges />}
            {!searchQuery && !selectedCategory && <Testimonials />}
            {!searchQuery && !selectedCategory && <TestimonialForm />}
          </>
        )}

        {currentPage === 'shop' && (
          <Shop onNavigate={handleNavigate} />
        )}

        {currentPage === 'product-detail' && selectedProduct && (
          <ProductDetail
            produit={selectedProduct}
            onBack={handleBackToHome}
          />
        )}

        {currentPage === 'cart' && (
          <Cart
            onContinueShopping={handleBackToHome}
            onCheckout={handleCheckout}
          />
        )}

        {currentPage === 'checkout' && (
          <Checkout
            onBack={handleBackToCart}
            onOrderComplete={handleOrderComplete}
          />
        )}

        {currentPage === 'order-confirmation' && orderData && (
          <OrderConfirmation
            client={orderData.client}
            orderId={orderData.orderId}
            onReturnHome={handleBackToHome}
            onViewTracking={() => handleViewOrderTracking(orderData.orderId)}
          />
        )}

        {currentPage === 'payment-success' && (
          <PaymentSuccess
            onReturnHome={handleBackToHome}
            onViewOrderTracking={handleViewOrderTracking}
          />
        )}

        {currentPage === 'order-tracking' && (
          <OrderTracking
            orderId={trackingOrderId}
            onOrderFound={(orderId) => setTrackingOrderId(orderId)}
            onBack={handleBackToHome}
          />
        )}

        {currentPage === 'admin-login' && (
          <AdminLogin onLoginSuccess={handleAdminLogin} />
        )}

        {currentPage === 'admin-dashboard' && (
          <AdminDashboard
            onLogout={handleAdminLogout}
          />
        )}

        {currentPage !== 'admin-login' && currentPage !== 'admin-dashboard' && (
          <footer className="bg-gray-900 text-white mt-auto">
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="mb-4">À propos</h3>
                <p className="text-sm text-gray-400">
                  TechStore, votre boutique en ligne de produits high-tech de qualité avec service client exceptionnel.
                </p>
              </div>
              <div>
                <h3 className="mb-4">Catégories</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Smartphones</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Ordinateurs</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Audio</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Photo & Vidéo</a></li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4">Service client</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Livraison</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Retours</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Garanties</a></li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4">Informations légales</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">CGV</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                  <li>
                    <button
                      onClick={() => handleNavigate('admin-login')}
                      className="hover:text-white transition-colors text-left"
                    >
                      Espace Admin
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2025 TechStore. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
        )}

        <Toaster position="top-right" richColors />
        </div>
      </CartProvider>
    </StripeProvider>
  );
}
