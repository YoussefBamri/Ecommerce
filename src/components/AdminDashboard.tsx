import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, LogOut, Tag, Percent, Upload, X as XIcon,
  Package, Truck, CheckCircle, Clock, Eye, RefreshCw, Shuffle,
  MessageSquare, LayoutDashboard, ShoppingCart, Users, BarChart3,
  Settings, Menu, TrendingUp, DollarSign, UserCheck, Star,
  Activity, Calendar, ArrowUpRight, ArrowDownRight, ChevronDown
} from 'lucide-react';
import { Produit } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from './ui/chart';
import { Area, AreaChart, Bar, BarChart, Pie, PieChart, Cell, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  fetchProduits,
  addProduitAvecImage,
  updateProduitAvecImage,
  deleteProduit,
  updateProduit,
  removeSale,
  applySale,
  getAllOrders,
  updateOrderStatus,
  shipOrder,
  deliverOrder,
  cancelOrder,
  getAllDrivers,
  getAvailableDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  toggleDriverAvailability,
  getAllTestimonials,
  getPendingTestimonials,
  approveTestimonial,
  deleteTestimonial,
  getAllReviews,
  deleteReview,
} from "../api/api";
import { mapBackendToFrontend } from '../utils/productMapper';
import '../styles/AdminDashboard.css';

// Import section components
import { DashboardSection } from './admin/DashboardSection';
import { ProductsSection } from './admin/ProductsSection';
import { OrdersSection } from './admin/OrdersSection';
import { DriversSection } from './admin/DriversSection';
import { TestimonialsSection } from './admin/TestimonialsSection';
import { ReviewsSection } from './admin/ReviewsSection';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface Order {
  id: number;
  dateCommande: string;
  total: number;
  statut: string;
  numeroSuivi?: string;
  transporteur?: string;
  dateExpedition?: string;
  dateLivraisonEstimee?: string;
  dateLivraisonReelle?: string;
  client: {
    id: number;
    nom: string;
    email: string;
  };
  driver?: {
    id: number;
    nomComplet: string;
    telephone: string;
    vehicule: string;
  };
}

interface Driver {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  vehicule: string;
  numeroPermis: string;
  disponible: boolean;
  dateCreation: string;
  nomComplet?: string;
}

interface Testimonial {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  authorRole?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [produits, setProduits] = useState<Produit[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isAddDriverDialogOpen, setIsAddDriverDialogOpen] = useState(false);
  const [isEditDriverDialogOpen, setIsEditDriverDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteConfirmData, setDeleteConfirmData] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Produit | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loadingStates, setLoadingStates] = useState({
    shipOrder: false,
    updateStatus: false,
    deliverOrder: false,
    cancelOrder: false,
    addProduct: false,
    editProduct: false,
    deleteProduct: false,
    toggleSale: false,
    removeSale: false,
    addDriver: false,
    editDriver: false,
    deleteDriver: false,
    toggleDriver: false,
    approveTestimonial: false,
    deleteTestimonial: false,
  });

  const [formData, setFormData] = useState({
    nom: '',
    prix: '',
    stock: '',
    description: '',
    categorie: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [saleData, setSaleData] = useState({ pourcentageSolde: '' });
  const [shipData, setShipData] = useState({ numeroSuivi: '', transporteur: 'DHL', notesLivraison: '', driverId: '' });
  const [statusData, setStatusData] = useState({ statut: '', commentaire: '' });
  const [driverFormData, setDriverFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    vehicule: '',
    numeroPermis: '',
  });

  const categories = [
    'Smartphones', 'Ordinateurs', 'Audio', 'Montres', 'Photo & Vidéo', 'Tablettes', 'Gaming', 'Autres'
  ];

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [produitsData, ordersData, driversData, testimonialsData] = await Promise.all([
          fetchProduits(),
          getAllOrders(),
          getAllDrivers(),
          getAllTestimonials()
        ]);

        const mappedProducts = produitsData
          .map((product: any) => {
            try {
              return mapBackendToFrontend(product);
            } catch (error) {
              return null;
            }
          })
          .filter((p: Produit | null): p is Produit => p !== null);

        setProduits(mappedProducts);
        setOrders(ordersData);
        setDrivers(driversData);
        setTestimonials(testimonialsData);
      } catch (err) {
        console.error("Erreur de chargement des données", err);
        toast.error("Erreur lors du chargement des données");
      }
    };
    loadData();
  }, []);

  // Load reviews when products change
  useEffect(() => {
    if (produits.length > 0) {
      loadReviews();
    }
  }, [produits]);

  const resetForm = () => {
    setFormData({ nom: '', prix: '', stock: '', description: '', categorie: '' });
    setImagePreview('');
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  // Product management functions
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nom", formData.nom);
      formDataToSend.append("prix", formData.prix);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("categorie", formData.categorie);
      if (imageFile) formDataToSend.append("image", imageFile);

      const newProdBackend = await addProduitAvecImage(formDataToSend);
      const newProd = mapBackendToFrontend(newProdBackend);
      setProduits((prev) => [...prev, newProd]);
      toast.success("✅ Produit ajouté avec succès !");
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur lors de l'ajout du produit");
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nom", formData.nom);
      formDataToSend.append("prix", formData.prix);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("categorie", formData.categorie);
      if (imageFile) formDataToSend.append("image", imageFile);

      const updatedProdBackend = await updateProduitAvecImage(currentProduct.idProd, formDataToSend);
      const updatedProd = mapBackendToFrontend(updatedProdBackend);
      setProduits((prev) =>
        prev.map((p) => (p.idProd === updatedProd.idProd ? updatedProd : p))
      );
      toast.success("✅ Produit modifié !");
      setIsEditDialogOpen(false);
      resetForm();
      setCurrentProduct(null);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la modification du produit");
    }
  };

  const handleDeleteProduct = async (idProd: number) => {
    try {
      await deleteProduit(idProd);
      setProduits((prev) => prev.filter((p) => p.idProd !== idProd));
      toast.success("🗑️ Produit supprimé !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  };

  const openEditDialog = (product: Produit) => {
    setCurrentProduct(product);
    setFormData({
      nom: product.nom,
      prix: product.prix.toString(),
      stock: product.stock.toString(),
      description: product.description || '',
      categorie: product.categorie || '',
    });
    setImagePreview(product.image || '');
    setIsEditDialogOpen(true);
  };

  const openSaleDialog = (product: Produit) => {
    setCurrentProduct(product);
    setSaleData({ pourcentageSolde: product.pourcentageSolde?.toString() || '' });
    setIsSaleDialogOpen(true);
  };

  const handleRemoveSale = async () => {
    if (!currentProduct) return;
    try {
      const updatedProdBackend = await removeSale(currentProduct.idProd);
      const updatedProd = mapBackendToFrontend(updatedProdBackend);
      setProduits((prev) =>
        prev.map((p) => (p.idProd === updatedProd.idProd ? updatedProd : p))
      );
      toast.success("✅ Solde retiré !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du retrait du solde");
    }
  };

  const handleToggleSale = async () => {
    if (!currentProduct) return;
    const pourcentage = parseFloat(saleData.pourcentageSolde);
    if (isNaN(pourcentage) || pourcentage <= 0 || pourcentage >= 100) {
      toast.error("❌ Pourcentage invalide");
      return;
    }

    try {
      const updatedProdBackend = await applySale(currentProduct.idProd, pourcentage);
      const updatedProd = mapBackendToFrontend(updatedProdBackend);
      setProduits((prev) =>
        prev.map((p) => (p.idProd === updatedProd.idProd ? updatedProd : p))
      );
      toast.success(`✅ ${pourcentage}% appliqué !`);
      setIsSaleDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Erreur de mise en solde");
    }
  };

  // Order management functions
  const openShipDialog = (order: Order) => {
    setCurrentOrder(order);
    setShipData({ numeroSuivi: '', transporteur: 'DHL', notesLivraison: 'Driver assigned', driverId: '' });
    setIsShipDialogOpen(true);
  };

  const openStatusDialog = (order: Order) => {
    setCurrentOrder(order);
    setStatusData({ statut: order.statut, commentaire: '' });
    setIsStatusDialogOpen(true);
  };

  const handleShipOrder = async () => {
    if (!currentOrder || !shipData.numeroSuivi.trim()) {
      toast.error("Numéro de suivi requis");
      return;
    }

    setLoadingStates(prev => ({ ...prev, shipOrder: true }));
    try {
      await shipOrder(currentOrder.id, {
        numeroSuivi: shipData.numeroSuivi,
        transporteur: shipData.transporteur,
        notesLivraison: shipData.notesLivraison,
        driverId: shipData.driverId ? parseInt(shipData.driverId) : null,
        utilisateur: 'Admin'
      });

      const ordersData = await getAllOrders();
      setOrders(ordersData);
      toast.success("Commande marquée comme expédiée");
      setIsShipDialogOpen(false);
      setCurrentOrder(null);
    } catch (err) {
      console.error("Erreur lors de l'expédition:", err);
      toast.error("Erreur lors de l'expédition de la commande");
    } finally {
      setLoadingStates(prev => ({ ...prev, shipOrder: false }));
    }
  };

  const handleUpdateStatus = async () => {
    if (!currentOrder || !statusData.statut) {
      toast.error("Statut requis");
      return;
    }

    setLoadingStates(prev => ({ ...prev, updateStatus: true }));
    try {
      await updateOrderStatus(currentOrder.id, {
        statut: statusData.statut,
        commentaire: statusData.commentaire,
        utilisateur: 'Admin'
      });

      const ordersData = await getAllOrders();
      setOrders(ordersData);
      toast.success("Statut mis à jour");
      setIsStatusDialogOpen(false);
      setCurrentOrder(null);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setLoadingStates(prev => ({ ...prev, updateStatus: false }));
    }
  };

  const handleDeliverOrder = async (order: Order) => {
    setLoadingStates(prev => ({ ...prev, deliverOrder: true }));
    try {
      await deliverOrder(order.id, { utilisateur: 'Admin' });
      const ordersData = await getAllOrders();
      setOrders(ordersData);
      toast.success("Commande marquée comme livrée");
    } catch (err) {
      console.error("Erreur lors de la livraison:", err);
      toast.error("Erreur lors de la livraison de la commande");
    } finally {
      setLoadingStates(prev => ({ ...prev, deliverOrder: false }));
    }
  };

  const handleCancelOrder = async (order: Order) => {
    const reason = prompt("Raison de l'annulation:");
    if (!reason) return;

    setLoadingStates(prev => ({ ...prev, cancelOrder: true }));
    try {
      await cancelOrder(order.id, { raison: reason, utilisateur: 'Admin' });
      const ordersData = await getAllOrders();
      setOrders(ordersData);
      toast.success("Commande annulée");
    } catch (err) {
      console.error("Erreur lors de l'annulation:", err);
      toast.error("Erreur lors de l'annulation de la commande");
    } finally {
      setLoadingStates(prev => ({ ...prev, cancelOrder: false }));
    }
  };

  const generateTrackingNumber = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setShipData(prev => ({ ...prev, numeroSuivi: result }));
  };

  const clearTrackingNumber = () => {
    setShipData(prev => ({ ...prev, numeroSuivi: '' }));
  };

  // Driver management functions
  const resetDriverForm = () => {
    setDriverFormData({
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      vehicule: '',
      numeroPermis: '',
    });
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingStates(prev => ({ ...prev, addDriver: true }));
    try {
      const newDriver = await createDriver(driverFormData);
      setDrivers((prev) => [...prev, newDriver]);
      toast.success("✅ Chauffeur ajouté avec succès !");
      setIsAddDriverDialogOpen(false);
      resetDriverForm();
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur lors de l'ajout du chauffeur");
    } finally {
      setLoadingStates(prev => ({ ...prev, addDriver: false }));
    }
  };

  const openEditDriverDialog = (driver: Driver) => {
    setCurrentDriver(driver);
    setDriverFormData({
      nom: driver.nom,
      prenom: driver.prenom,
      telephone: driver.telephone,
      email: driver.email,
      vehicule: driver.vehicule,
      numeroPermis: driver.numeroPermis,
    });
    setIsEditDriverDialogOpen(true);
  };

  const handleEditDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDriver) return;

    try {
      const updatedDriver = await updateDriver(currentDriver.id, driverFormData);
      setDrivers((prev) =>
        prev.map((d) => (d.id === updatedDriver.id ? updatedDriver : d))
      );
      toast.success("✅ Chauffeur modifié !");
      setIsEditDriverDialogOpen(false);
      resetDriverForm();
      setCurrentDriver(null);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la modification du chauffeur");
    }
  };

  const handleDeleteDriver = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce chauffeur ?")) return;

    try {
      await deleteDriver(id);
      setDrivers((prev) => prev.filter((d) => d.id !== id));
      toast.success("🗑️ Chauffeur supprimé !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleToggleDriverAvailability = async (id: number) => {
    try {
      const updatedDriver = await toggleDriverAvailability(id);
      setDrivers((prev) =>
        prev.map((d) => (d.id === updatedDriver.id ? updatedDriver : d))
      );
      toast.success(`✅ Chauffeur ${updatedDriver.disponible ? 'activé' : 'désactivé'} !`);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du changement de disponibilité");
    }
  };

  // Testimonial management functions
  const handleApproveTestimonial = async (testimonialId: number) => {
    setLoadingStates(prev => ({ ...prev, approveTestimonial: true }));
    try {
      await approveTestimonial(testimonialId);
      setTestimonials((prev) =>
        prev.map((t) => (t.id === testimonialId ? { ...t, isApproved: true } : t))
      );
      toast.success("✅ Témoignage approuvé !");
    } catch (err) {
      console.error("Erreur lors de l'approbation du témoignage:", err);
      toast.error("Erreur lors de l'approbation");
    } finally {
      setLoadingStates(prev => ({ ...prev, approveTestimonial: false }));
    }
  };

  const handleDeleteTestimonial = async (testimonialId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce témoignage ?")) return;

    setLoadingStates(prev => ({ ...prev, deleteTestimonial: true }));
    try {
      await deleteTestimonial(testimonialId);
      setTestimonials((prev) => prev.filter((t) => t.id !== testimonialId));
      toast.success("🗑️ Témoignage supprimé !");
    } catch (err) {
      console.error("Erreur lors de la suppression du témoignage:", err);
      toast.error("Erreur lors de la suppression");
    } finally {
      setLoadingStates(prev => ({ ...prev, deleteTestimonial: false }));
    }
  };

  // Review management functions
  const loadReviews = async () => {
    try {
      const allReviews = await getAllReviews();
      setReviews(allReviews);
    } catch (err) {
      console.error("Erreur de chargement des avis", err);
      toast.error("Impossible de charger les avis");
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    showDeleteConfirm(
      "Supprimer l'avis",
      "Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.",
      async () => {
        try {
          await deleteReview(reviewId);
          setReviews((prev) => prev.filter((r) => r.id !== reviewId));
          toast.success("🗑️ Avis supprimé !");
        } catch (err) {
          console.error("Erreur lors de la suppression de l'avis:", err);
          toast.error("Erreur lors de la suppression");
        }
      }
    );
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSING': return 'bg-purple-100 text-purple-800';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />;
      case 'PROCESSING': return <Package className="h-4 w-4" />;
      case 'SHIPPED': return <Truck className="h-4 w-4" />;
      case 'DELIVERED': return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED': return <Clock className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    onLogout();
    toast.success("Déconnexion réussie");
  };

  // Helper function to show delete confirmation modal
  const showDeleteConfirm = (title: string, message: string, onConfirm: () => void) => {
    setDeleteConfirmData({ title, message, onConfirm });
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmData?.onConfirm) {
      deleteConfirmData.onConfirm();
    }
    setIsDeleteConfirmOpen(false);
    setDeleteConfirmData(null);
  };

  // Calculate statistics for dashboard
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalProducts = produits.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.statut === 'PENDING').length;
  const availableDrivers = drivers.filter(driver => driver.disponible).length;
  const pendingTestimonials = testimonials.filter(t => !t.isApproved).length;

  // Calculate order status distribution
  const orderStatusCounts = orders.reduce((acc, order) => {
    acc[order.statut] = (acc[order.statut] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const orderStatusData = [
    { name: 'En attente', value: orderStatusCounts['PENDING'] || 0, fill: '#fbbf24' },
    { name: 'Confirmée', value: orderStatusCounts['CONFIRMED'] || 0, fill: '#3b82f6' },
    { name: 'En préparation', value: orderStatusCounts['PROCESSING'] || 0, fill: '#8b5cf6' },
    { name: 'Expédiée', value: orderStatusCounts['SHIPPED'] || 0, fill: '#06b6d4' },
    { name: 'Livrée', value: orderStatusCounts['DELIVERED'] || 0, fill: '#10b981' },
  ];

  // Calculate monthly revenue data (last 6 months)
  const monthlyRevenue = orders.reduce((acc, order) => {
    const date = new Date(order.dateCommande);
    const monthKey = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    acc[monthKey] = (acc[monthKey] || 0) + order.total;
    return acc;
  }, {} as Record<string, number>);

  const revenueData = Object.entries(monthlyRevenue)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-6)
    .map(([month, revenue]) => ({ month, revenue }));

  // Calculate product categories distribution
  const categoryCounts = produits.reduce((acc, product) => {
    const category = product.categorie || 'Autres';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
    fill: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  // Recent orders (last 5)
  const recentOrders = orders
    .sort((a, b) => new Date(b.dateCommande).getTime() - new Date(a.dateCommande).getTime())
    .slice(0, 5);

  // Top selling products
  const productSales = produits.map(product => ({
    ...product,
    salesCount: Math.floor(Math.random() * 50) + 1 // This would come from actual sales data
  })).sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);

  // Performance metrics
  const todayOrders = orders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.dateCommande);
    return orderDate.toDateString() === today.toDateString();
  }).length;

  const weeklyOrders = orders.filter(order => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const orderDate = new Date(order.dateCommande);
    return orderDate >= weekAgo;
  }).length;

  const currentMonthRevenue = orders.filter(order => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const orderDate = new Date(order.dateCommande);
    return orderDate >= monthAgo;
  }).reduce((sum, order) => sum + order.total, 0);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="admin-dashboard-content">
            {/* Key Performance Indicators - Row 1 (Anchoring) */}
            <div className="admin-kpi-row">
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card">
                  <div className="admin-kpi-value">{totalRevenue.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' })}</div>
                  <div className="admin-kpi-label">Revenus totaux</div>
                  <div className="admin-kpi-trend positive">
                    <ArrowUpRight className="admin-trend-icon" />
                    <span>+{totalRevenue > 0 ? ((currentMonthRevenue / totalRevenue) * 100).toFixed(1) : 0}% ce mois</span>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-value">{totalOrders}</div>
                  <div className="admin-kpi-label">Total commandes</div>
                  <div className="admin-kpi-trend neutral">
                    <span>{weeklyOrders} cette semaine</span>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-value">{pendingOrders}</div>
                  <div className="admin-kpi-label">Commandes en attente</div>
                  <div className="admin-kpi-trend warning">
                    <span>{todayOrders} aujourd'hui</span>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-value">{totalProducts}</div>
                  <div className="admin-kpi-label">Produits actifs</div>
                  <div className="admin-kpi-trend neutral">
                    <span>{Object.keys(categoryCounts).length} catégories</span>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-value">{availableDrivers}</div>
                  <div className="admin-kpi-label">Chauffeurs actifs</div>
                  <div className="admin-kpi-trend neutral">
                    <span>sur {drivers.length} chauffeurs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section - Row 2 (Data Visualization) */}
            <div className="admin-charts-section">
              <div className="admin-charts-grid">
                <div className="admin-chart-container">
                  <h3 className="admin-chart-title">Évolution des revenus</h3>
                  <div className="admin-chart-subtitle">Derniers 6 mois</div>
                  <div className="admin-chart-wrapper">
                    <ChartContainer
                      config={{
                        revenue: {
                          label: "Revenus",
                          color: "#3b82f6",
                        },
                      }}
                      className="admin-chart"
                    >
                      <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="2 2" />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </div>

                <div className="admin-chart-container">
                  <h3 className="admin-chart-title">Statut des commandes</h3>
                  <div className="admin-chart-subtitle">Répartition actuelle</div>
                  <div className="admin-chart-wrapper">
                    <ChartContainer
                      config={{
                        pending: { label: "En attente", color: "#f59e0b" },
                        confirmed: { label: "Confirmée", color: "#3b82f6" },
                        processing: { label: "En préparation", color: "#8b5cf6" },
                        shipped: { label: "Expédiée", color: "#06b6d4" },
                        delivered: { label: "Livrée", color: "#10b981" },
                      }}
                      className="admin-chart"
                    >
                      <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  </div>
                  <div className="admin-chart-legend">
                    {orderStatusData.map((item, index) => (
                      <div key={index} className="admin-legend-item">
                        <div className="admin-legend-color" style={{ backgroundColor: item.fill }}></div>
                        <span className="admin-legend-text">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Details Section - Row 3 (Deep-dive) */}
            <div className="admin-details-section">
              <div className="admin-details-grid">
                <div className="admin-detail-card">
                  <h3 className="admin-detail-title">Activité récente</h3>
                  <div className="admin-activity-list">
                    {recentOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="admin-activity-item">
                        <div className="admin-activity-info">
                          <div className="admin-activity-id">#{order.id.toString().padStart(6, '0')}</div>
                          <div className="admin-activity-client">{order.client.nom}</div>
                        </div>
                        <div className="admin-activity-meta">
                          <div className="admin-activity-amount">{order.total.toFixed(2)} TND</div>
                          <div className={`admin-activity-status status-${order.statut.toLowerCase()}`}>
                            {order.statut.toLowerCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {recentOrders.length === 0 && (
                      <div className="admin-empty-state">
                        <Package className="admin-empty-icon" />
                        <span>Aucune activité récente</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-detail-card">
                  <h3 className="admin-detail-title">Actions rapides</h3>
                  <div className="admin-actions-grid">
                    <button
                      className="admin-action-button"
                      onClick={() => setActiveSection('products')}
                    >
                      <Plus className="admin-action-icon" />
                      <span>Nouveau produit</span>
                    </button>
                    <button
                      className="admin-action-button"
                      onClick={() => setActiveSection('orders')}
                    >
                      <Truck className="admin-action-icon" />
                      <span>Traiter commandes</span>
                    </button>
                    <button
                      className="admin-action-button"
                      onClick={() => setActiveSection('drivers')}
                    >
                      <UserCheck className="admin-action-icon" />
                      <span>Gérer chauffeurs</span>
                    </button>
                    <button
                      className="admin-action-button"
                      onClick={() => setActiveSection('testimonials')}
                    >
                      <MessageSquare className="admin-action-icon" />
                      <span>Voir témoignages</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Section - Conditional */}
            {pendingTestimonials > 0 && (
              <div className="admin-alert-section">
                <div className="admin-alert-card">
                  <div className="admin-alert-content">
                    <Star className="admin-alert-icon" />
                    <div>
                      <div className="admin-alert-title">Témoignages en attente</div>
                      <div className="admin-alert-description">
                        {pendingTestimonials} témoignage(s) à approuver
                      </div>
                    </div>
                  </div>
                  <button
                    className="admin-alert-button"
                    onClick={() => setActiveSection('testimonials')}
                  >
                    Voir les témoignages
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'products':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Actions */}
            <div className="mb-6">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 hover:scale-105 transition-transform duration-200">
                    <Plus className="h-4 w-4" />
                    Ajouter un produit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau produit</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations du produit
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct}>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="add-nom">Nom du produit *</Label>
                          <Input
                            id="add-nom"
                            value={formData.nom}
                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-categorie">Catégorie *</Label>
                          <Select
                            value={formData.categorie}
                            onValueChange={(value: string) => setFormData({ ...formData, categorie: value })}
                            required
                          >
                            <SelectTrigger id="add-categorie">
                              <SelectValue placeholder="Sélectionnez" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="add-prix">Prix (TND) *</Label>
                          <Input
                            id="add-prix"
                            type="number"
                            step="0.01"
                            value={formData.prix}
                            onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-stock">Stock *</Label>
                          <Input
                            id="add-stock"
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="add-image">Image du produit</Label>
                        {imagePreview ? (
                          <div className="space-y-2">
                            <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-gray-50">
                              <img
                                src={imagePreview}
                                alt="Aperçu"
                                className="w-full h-full object-contain"
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2"
                                onClick={clearImage}
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                            <Label htmlFor="add-image" className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                              Cliquez pour sélectionner une image
                            </Label>
                            <Input
                              id="add-image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF jusqu'à 10MB</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="add-description">Description</Label>
                        <Textarea
                          id="add-description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit" disabled={loadingStates.addProduct}>
                        {loadingStates.addProduct ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Ajout...
                          </>
                        ) : (
                          "Ajouter"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des produits</CardTitle>
                <CardDescription>
                  Gérez vos produits, leurs stocks et leurs prix
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Image</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produits.map((product) => (
                        <TableRow key={product.idProd}>
                          <TableCell>
                            <img
                              src={product.image || '/placeholder.png'}
                              alt={product.nom}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                            />
                          </TableCell>

                          <TableCell>
                            <div className="max-w-xs">
                              <div className="line-clamp-2">{product.nom}</div>
                            </div>
                          </TableCell>
                          <TableCell>{product.categorie}</TableCell>
                          <TableCell>
                            <div>
                              {product.enSolde ? (
                                <div className="flex flex-col">
                                  <span className="text-sm line-through text-gray-400">
                                    {product.prixOriginal?.toFixed(2)} TND
                                  </span>
                                  <span className="text-red-600">
                                    {product.prix.toFixed(2)} TND
                                  </span>
                                </div>
                              ) : (
                                <span>{product.prix.toFixed(2)} TND</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            {product.enSolde && (
                              <Badge variant="destructive" className="gap-1">
                                <Percent className="h-3 w-3" />
                                -{product.pourcentageSolde}%
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {product.enSolde ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setCurrentProduct(product);
                                    handleRemoveSale();
                                  }}
                                  className="gap-1"
                                >
                                  <Tag className="h-3 w-3" />
                                  Retirer solde
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openSaleDialog(product)}
                                  className="gap-1"
                                >
                                  <Tag className="h-3 w-3" />
                                  Solde
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(product)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteProduct(product.idProd)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Orders Table */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des commandes</CardTitle>
                <CardDescription>
                  Gérez les commandes, statuts et expéditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Chauffeur</TableHead>
                        <TableHead>Suivi</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono">#{order.id.toString().padStart(6, '0')}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.client.nom}</div>
                              <div className="text-sm text-gray-500">{order.client.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(order.dateCommande).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>{order.total.toFixed(2)} TND</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(order.statut)}>
                              {getStatusIcon(order.statut)}
                              <span className="ml-1 capitalize">{order.statut.toLowerCase()}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.driver ? (
                              <div>
                                <div className="font-medium text-sm">{order.driver.nomComplet}</div>
                                <div className="text-xs text-gray-500">{order.driver.vehicule}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Non assigné</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {order.numeroSuivi ? (
                              <span className="font-mono text-sm">{order.numeroSuivi}</span>
                            ) : (
                              <span className="text-gray-400">Non défini</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openStatusDialog(order)}
                              >
                                Modifier statut
                              </Button>
                              {order.statut === 'PROCESSING' && (
                                <Button
                                  size="sm"
                                  onClick={() => openShipDialog(order)}
                                >
                                  <Truck className="h-3 w-3 mr-1" />
                                  Expédier
                                </Button>
                              )}
                              {order.statut === 'SHIPPED' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleDeliverOrder(order)}
                                  disabled={loadingStates.deliverOrder}
                                >
                                  {loadingStates.deliverOrder ? (
                                    <>
                                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                      Livraison...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Livrer
                                    </>
                                  )}
                                </Button>
                              )}
                              {order.statut !== 'DELIVERED' && order.statut !== 'CANCELLED' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleCancelOrder(order)}
                                  disabled={loadingStates.cancelOrder}
                                >
                                  {loadingStates.cancelOrder ? (
                                    <>
                                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                      Annulation...
                                    </>
                                  ) : (
                                    "Annuler"
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'drivers':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Drivers Actions */}
            <div className="mb-6">
              <Dialog open={isAddDriverDialogOpen} onOpenChange={setIsAddDriverDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 hover:scale-105 transition-transform duration-200">
                    <Plus className="h-4 w-4" />
                    Ajouter un chauffeur
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau chauffeur</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations du chauffeur
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddDriver}>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="add-driver-nom">Nom *</Label>
                          <Input
                            id="add-driver-nom"
                            value={driverFormData.nom}
                            onChange={(e) => setDriverFormData({ ...driverFormData, nom: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-driver-prenom">Prénom *</Label>
                          <Input
                            id="add-driver-prenom"
                            value={driverFormData.prenom}
                            onChange={(e) => setDriverFormData({ ...driverFormData, prenom: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="add-driver-telephone">Téléphone *</Label>
                          <Input
                            id="add-driver-telephone"
                            type="tel"
                            value={driverFormData.telephone}
                            onChange={(e) => setDriverFormData({ ...driverFormData, telephone: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-driver-email">Email *</Label>
                          <Input
                            id="add-driver-email"
                            type="email"
                            value={driverFormData.email}
                            onChange={(e) => setDriverFormData({ ...driverFormData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="add-driver-vehicule">Véhicule *</Label>
                          <Input
                            id="add-driver-vehicule"
                            value={driverFormData.vehicule}
                            onChange={(e) => setDriverFormData({ ...driverFormData, vehicule: e.target.value })}
                            placeholder="ex: Voiture, Moto, Camion"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-driver-numeroPermis">Numéro de permis *</Label>
                          <Input
                            id="add-driver-numeroPermis"
                            value={driverFormData.numeroPermis}
                            onChange={(e) => setDriverFormData({ ...driverFormData, numeroPermis: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddDriverDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit" disabled={loadingStates.addDriver}>
                        {loadingStates.addDriver ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Ajout...
                          </>
                        ) : (
                          "Ajouter"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Drivers Table */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des chauffeurs</CardTitle>
                <CardDescription>
                  Gérez vos chauffeurs et leur disponibilité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nom complet</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Véhicule</TableHead>
                        <TableHead>Disponibilité</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell className="font-mono">#{driver.id.toString().padStart(4, '0')}</TableCell>
                          <TableCell>
                            <div className="font-medium">{driver.nomComplet || `${driver.prenom} ${driver.nom}`}</div>
                          </TableCell>
                          <TableCell>{driver.telephone}</TableCell>
                          <TableCell>{driver.email}</TableCell>
                          <TableCell>{driver.vehicule}</TableCell>
                          <TableCell>
                            <Badge className={driver.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {driver.disponible ? 'Disponible' : 'Indisponible'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDriverDialog(driver)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant={driver.disponible ? "destructive" : "default"}
                                onClick={() => handleToggleDriverAvailability(driver.id)}
                              >
                                {driver.disponible ? 'Désactiver' : 'Activer'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteDriver(driver.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Testimonials Table */}
            <Card>
              <CardHeader>
                <CardTitle>Gestion des témoignages</CardTitle>
                <CardDescription>
                  Approuvez ou rejetez les témoignages soumis par les utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Auteur</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Commentaire</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testimonials.map((testimonial) => (
                        <TableRow key={testimonial.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{testimonial.authorName}</div>
                              {testimonial.authorRole && (
                                <div className="text-sm text-gray-500">{testimonial.authorRole}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: testimonial.rating }).map((_, i) => (
                                <span key={i} className="text-yellow-400">⭐</span>
                              ))}
                              <span className="ml-1 text-sm text-gray-600">({testimonial.rating}/5)</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="line-clamp-2">{testimonial.comment}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={testimonial.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {testimonial.isApproved ? 'Approuvé' : 'En attente'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(testimonial.createdAt).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {!testimonial.isApproved && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveTestimonial(testimonial.id)}
                                  disabled={loadingStates.approveTestimonial}
                                  className="gap-1"
                                >
                                  {loadingStates.approveTestimonial ? (
                                    <>
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                      Approuver...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-3 w-3" />
                                      Approuver
                                    </>
                                  )}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteTestimonial(testimonial.id)}
                                disabled={loadingStates.deleteTestimonial}
                              >
                                {loadingStates.deleteTestimonial ? (
                                  <>
                                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                    Supprimer...
                                  </>
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {testimonials.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun témoignage pour le moment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'reviews':
        return (
          <div className="admin-reviews-section">
            <div className="admin-reviews-header">
              <h3 className="admin-section-title">Gestion des avis produits</h3>
              <p className="admin-section-subtitle">Consultez et gérez les avis laissés par les clients</p>
            </div>

            <div className="admin-reviews-content">
              {produits.map((product) => (
                <div key={product.idProd} className="admin-product-reviews-card">
                  <div
                    className="admin-product-header"
                    onClick={() => {
                      const newExpanded = new Set(expandedProducts);
                      if (newExpanded.has(product.idProd)) {
                        newExpanded.delete(product.idProd);
                      } else {
                        newExpanded.add(product.idProd);
                      }
                      setExpandedProducts(newExpanded);
                    }}
                  >
                    <div className="admin-product-info">
                      <img
                        src={product.image || '/placeholder.png'}
                        alt={product.nom}
                        className="admin-product-image"
                        onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                      />
                      <div>
                        <h4 className="admin-product-name">{product.nom}</h4>
                        <p className="admin-product-category">{product.categorie}</p>
                      </div>
                    </div>
                    <div className="admin-product-toggle">
                      <span className="admin-review-count">
                        {reviews.filter(r => r.idProd === product.idProd).length} avis
                      </span>
                      <ChevronDown
                        className={`admin-toggle-icon ${expandedProducts.has(product.idProd) ? 'rotated' : ''}`}
                      />
                    </div>
                  </div>

                  {expandedProducts.has(product.idProd) && (
                    <div className="admin-reviews-list">
                      {reviews
                        .filter(review => review.idProd === product.idProd)
                        .map((review) => (
                          <div key={review.id} className="admin-review-item">
                            <div className="admin-review-header">
                              <div className="admin-review-user">
                                <div className="admin-review-avatar">
                                  {review.authorName?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <div className="admin-review-author">
                                    {review.authorName || 'Utilisateur anonyme'}
                                  </div>
                                  <div className="admin-review-date">
                                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                  </div>
                                </div>
                              </div>
                              <div className="admin-review-actions">
                                <div className="admin-review-rating">
                                  {Array.from({ length: review.rating || 0 }).map((_, i) => (
                                    <Star key={i} className="admin-star-filled" />
                                  ))}
                                  {Array.from({ length: 5 - (review.rating || 0) }).map((_, i) => (
                                    <Star key={i} className="admin-star-empty" />
                                  ))}
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="admin-delete-review-btn"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="admin-review-content">
                              <p>{review.comment}</p>
                            </div>
                          </div>
                        ))}

                      {reviews.filter(r => r.idProd === product.idProd).length === 0 && (
                        <div className="admin-no-reviews">
                          <MessageSquare className="admin-no-reviews-icon" />
                          <span>Aucun avis pour ce produit</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {produits.length === 0 && (
                <div className="admin-empty-state">
                  <Package className="admin-empty-icon" />
                  <span>Aucun produit disponible</span>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-lg">Admin Panel</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="space-y-2">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`admin-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-medium">Tableau de bord</span>
            </button>

            <button
              onClick={() => setActiveSection('products')}
              className={`admin-nav-item ${activeSection === 'products' ? 'active' : ''}`}
            >
              <Package className="h-5 w-5" />
              <span className="font-medium">Produits</span>
            </button>

            <button
              onClick={() => setActiveSection('orders')}
              className={`admin-nav-item ${activeSection === 'orders' ? 'active' : ''}`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">Commandes</span>
            </button>

            <button
              onClick={() => setActiveSection('drivers')}
              className={`admin-nav-item ${activeSection === 'drivers' ? 'active' : ''}`}
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">Chauffeurs</span>
            </button>

            <button
              onClick={() => setActiveSection('testimonials')}
              className={`admin-nav-item ${activeSection === 'testimonials' ? 'active' : ''}`}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">Témoignages</span>
            </button>

            <button
              onClick={() => setActiveSection('reviews')}
              className={`admin-nav-item ${activeSection === 'reviews' ? 'active' : ''}`}
            >
              <Star className="h-5 w-5" />
              <span className="font-medium">Avis produits</span>
            </button>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full gap-2 hover:bg-red-50 hover:border-red-200"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main-content">
        <header className="admin-header">
          <h1 className="text-2xl font-semibold text-gray-900">
            {activeSection === 'dashboard' ? 'Tableau de bord' :
             activeSection === 'products' ? 'Gestion des Produits' :
             activeSection === 'orders' ? 'Gestion des Commandes' :
             activeSection === 'drivers' ? 'Gestion des Chauffeurs' :
             activeSection === 'testimonials' ? 'Gestion des Témoignages' :
             activeSection === 'reviews' ? 'Gestion des Avis Produits' : 'Admin Panel'}
          </h1>
        </header>

        <main className="admin-content">
          {renderContent()}
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
            <DialogDescription>
              Modifiez les informations du produit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProduct}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nom">Nom du produit *</Label>
                  <Input
                    id="edit-nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-categorie">Catégorie *</Label>
                  <Select
                    value={formData.categorie}
                    onValueChange={(value) => setFormData({ ...formData, categorie: value })}
                    required
                  >
                    <SelectTrigger id="edit-categorie">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-prix">Prix (TND) *</Label>
                  <Input
                    id="edit-prix"
                    type="number"
                    step="0.01"
                    value={formData.prix}
                    onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Stock *</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image">Image du produit</Label>
                {imagePreview ? (
                  <div className="space-y-2">
                    <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="w-full h-full object-contain"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={clearImage}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <Label htmlFor="edit-image" className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                      Cliquez pour sélectionner une image
                    </Label>
                    <Input
                      id="edit-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF jusqu'à 10MB</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sale Dialog */}
      <Dialog open={isSaleDialogOpen} onOpenChange={setIsSaleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre en solde</DialogTitle>
            <DialogDescription>
              Définissez le pourcentage de réduction pour ce produit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentProduct && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Produit</p>
                <p>{currentProduct.nom}</p>
                <p className="text-sm text-gray-600 mt-2">Prix actuel</p>
                <p className="text-lg">{currentProduct.enSolde ? currentProduct.prixOriginal : currentProduct.prix} TND</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="sale-percent">Pourcentage de réduction (%) *</Label>
              <Input
                id="sale-percent"
                type="number"
                min="1"
                max="99"
                value={saleData.pourcentageSolde}
                onChange={(e) => setSaleData({ pourcentageSolde: e.target.value })}
                placeholder="ex: 25"
                required
              />
            </div>
            {currentProduct && saleData.pourcentageSolde && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600">Nouveau prix</p>
                <p className="text-2xl text-blue-600">
                  {(
                    (currentProduct.enSolde ? currentProduct.prixOriginal! : currentProduct.prix) *
                    (1 - parseFloat(saleData.pourcentageSolde) / 100)
                  ).toFixed(2)} TND
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Économie de {parseFloat(saleData.pourcentageSolde)}%
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsSaleDialogOpen(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleToggleSale}>
              Appliquer le solde
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ship Order Dialog */}
      <Dialog open={isShipDialogOpen} onOpenChange={setIsShipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Expédier la commande</DialogTitle>
            <DialogDescription>
              Ajoutez les informations de suivi pour l'expédition
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentOrder && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Commande</p>
                <p className="font-medium">#{currentOrder.id.toString().padStart(6, '0')}</p>
                <p className="text-sm text-gray-600 mt-2">Client</p>
                <p>{currentOrder.client.nom}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="tracking-number">Numéro de suivi *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="tracking-number"
                    value={shipData.numeroSuivi}
                    onChange={(e) => setShipData({ ...shipData, numeroSuivi: e.target.value })}
                    placeholder="ex: 1Z999AA1234567890"
                    required
                    disabled={!!shipData.numeroSuivi}
                    className={`transition-all duration-200 ${
                      shipData.numeroSuivi
                        ? "bg-slate-50 border-slate-300 text-slate-700"
                        : "bg-white"
                    }`}
                    style={{
                      paddingRight: shipData.numeroSuivi ? '2.5rem' : '0.75rem'
                    }}
                  />
                  {shipData.numeroSuivi && (
                    <button
                      type="button"
                      onClick={clearTrackingNumber}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                      title="Effacer le numéro de suivi"
                      style={{
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateTrackingNumber}
                  className="gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <Shuffle className="h-4 w-4" />
                  Générer
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="carrier">Transporteur *</Label>
              <Select
                value={shipData.transporteur}
                onValueChange={(value) => setShipData({ ...shipData, transporteur: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DHL">DHL</SelectItem>
                  <SelectItem value="UPS">UPS</SelectItem>
                  <SelectItem value="FedEx">FedEx</SelectItem>
                  <SelectItem value="Colissimo">Colissimo</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver">Chauffeur assigné</Label>
              <Select
                value={shipData.driverId}
                onValueChange={(value) => setShipData({ ...shipData, driverId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un chauffeur (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.filter(d => d.disponible).map((driver) => (
                    <SelectItem key={driver.id} value={driver.id.toString()}>
                      {driver.nomComplet || `${driver.prenom} ${driver.nom}`} - {driver.vehicule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notesLivraison">Notes de livraison</Label>
              <Input
                id="notesLivraison"
                value={shipData.notesLivraison}
                onChange={(e) => setShipData({ ...shipData, notesLivraison: e.target.value })}
                placeholder="ex: Livrer à l'adresse principale"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsShipDialogOpen(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleShipOrder} disabled={loadingStates.shipOrder}>
              {loadingStates.shipOrder ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Expédition...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Marquer comme expédiée
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le statut</DialogTitle>
            <DialogDescription>
              Changez le statut de la commande
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentOrder && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Commande</p>
                <p className="font-medium">#{currentOrder.id.toString().padStart(6, '0')}</p>
                <p className="text-sm text-gray-600 mt-2">Statut actuel</p>
                <Badge className={getStatusBadgeColor(currentOrder.statut)}>
                  {currentOrder.statut}
                </Badge>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-status">Nouveau statut *</Label>
              <Select
                value={statusData.statut}
                onValueChange={(value) => setStatusData({ ...statusData, statut: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmée</SelectItem>
                  <SelectItem value="PROCESSING">En préparation</SelectItem>
                  <SelectItem value="SHIPPED">Expédiée</SelectItem>
                  <SelectItem value="DELIVERED">Livrée</SelectItem>
                  <SelectItem value="CANCELLED">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-comment">Commentaire (optionnel)</Label>
              <Input
                id="status-comment"
                value={statusData.commentaire}
                onChange={(e) => setStatusData({ ...statusData, commentaire: e.target.value })}
                placeholder="Raison du changement..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleUpdateStatus} disabled={loadingStates.updateStatus}>
              {loadingStates.updateStatus ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Mettre à jour"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Driver Dialog */}
      <Dialog open={isAddDriverDialogOpen} onOpenChange={setIsAddDriverDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau chauffeur</DialogTitle>
            <DialogDescription>
              Remplissez les informations du chauffeur
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDriver}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-driver-nom">Nom *</Label>
                  <Input
                    id="add-driver-nom"
                    value={driverFormData.nom}
                    onChange={(e) => setDriverFormData({ ...driverFormData, nom: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-driver-prenom">Prénom *</Label>
                  <Input
                    id="add-driver-prenom"
                    value={driverFormData.prenom}
                    onChange={(e) => setDriverFormData({ ...driverFormData, prenom: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-driver-telephone">Téléphone *</Label>
                  <Input
                    id="add-driver-telephone"
                    type="tel"
                    value={driverFormData.telephone}
                    onChange={(e) => setDriverFormData({ ...driverFormData, telephone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-driver-email">Email *</Label>
                  <Input
                    id="add-driver-email"
                    type="email"
                    value={driverFormData.email}
                    onChange={(e) => setDriverFormData({ ...driverFormData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-driver-vehicule">Véhicule *</Label>
                  <Input
                    id="add-driver-vehicule"
                    value={driverFormData.vehicule}
                    onChange={(e) => setDriverFormData({ ...driverFormData, vehicule: e.target.value })}
                    placeholder="ex: Voiture, Moto, Camion"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-driver-numeroPermis">Numéro de permis *</Label>
                  <Input
                    id="add-driver-numeroPermis"
                    value={driverFormData.numeroPermis}
                    onChange={(e) => setDriverFormData({ ...driverFormData, numeroPermis: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDriverDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={loadingStates.addDriver}>
                {loadingStates.addDriver ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Ajout...
                  </>
                ) : (
                  "Ajouter"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Driver Dialog */}
      <Dialog open={isEditDriverDialogOpen} onOpenChange={setIsEditDriverDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le chauffeur</DialogTitle>
            <DialogDescription>
              Modifiez les informations du chauffeur
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditDriver}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-driver-nom">Nom *</Label>
                  <Input
                    id="edit-driver-nom"
                    value={driverFormData.nom}
                    onChange={(e) => setDriverFormData({ ...driverFormData, nom: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-driver-prenom">Prénom *</Label>
                  <Input
                    id="edit-driver-prenom"
                    value={driverFormData.prenom}
                    onChange={(e) => setDriverFormData({ ...driverFormData, prenom: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-driver-telephone">Téléphone *</Label>
                  <Input
                    id="edit-driver-telephone"
                    type="tel"
                    value={driverFormData.telephone}
                    onChange={(e) => setDriverFormData({ ...driverFormData, telephone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-driver-email">Email *</Label>
                  <Input
                    id="edit-driver-email"
                    type="email"
                    value={driverFormData.email}
                    onChange={(e) => setDriverFormData({ ...driverFormData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-driver-vehicule">Véhicule *</Label>
                  <Input
                    id="edit-driver-vehicule"
                    value={driverFormData.vehicule}
                    onChange={(e) => setDriverFormData({ ...driverFormData, vehicule: e.target.value })}
                    placeholder="ex: Voiture, Moto, Camion"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-driver-numeroPermis">Numéro de permis *</Label>
                  <Input
                    id="edit-driver-numeroPermis"
                    value={driverFormData.numeroPermis}
                    onChange={(e) => setDriverFormData({ ...driverFormData, numeroPermis: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDriverDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-3 h-3 text-red-600" />
              </div>
              {deleteConfirmData?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {deleteConfirmData?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="hover:bg-gray-50"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { AdminDashboard };
