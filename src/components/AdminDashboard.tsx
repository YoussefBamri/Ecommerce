import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, LogOut, Tag, Percent, Upload, X as XIcon, Package, Truck, CheckCircle, Clock, Eye } from 'lucide-react';
import { Produit } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';
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
} from "../api/api";
import { mapBackendToFrontend } from '../utils/productMapper';


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
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Produit | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nom: '',
    prix: '',
    stock: '',
    description: '',
    categorie: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [saleData, setSaleData] = useState({ pourcentageSolde: '' });
  const [shipData, setShipData] = useState({ numeroSuivi: '', transporteur: 'DHL' });
  const [statusData, setStatusData] = useState({ statut: '', commentaire: '' });

  const categories = [
    'Smartphones', 'Ordinateurs', 'Audio', 'Montres', 'Photo & Vidéo', 'Tablettes', 'Gaming', 'Autres'
  ];

  // 📦 Charger les produits du backend
  useEffect(() => {
    const loadProduits = async () => {
      try {
        const backendData = await fetchProduits();
        console.log('📦 AdminDashboard - Produits reçus du backend:', backendData);
        // Mapper les produits du backend vers le format frontend
        const mappedProducts = backendData
          .map((product: any, index: number) => {
            try {
              return mapBackendToFrontend(product);
            } catch (error) {
              console.error(`❌ Erreur lors du mapping du produit ${index}:`, error, product);
              return null;
            }
          })
          .filter((p: Produit | null): p is Produit => p !== null);
        console.log('✅ AdminDashboard - Produits mappés:', mappedProducts);
        setProduits(mappedProducts);
      } catch (err) {
        console.error("Erreur de chargement des produits", err);
        toast.error("Impossible de charger les produits");
      }
    };
    loadProduits();
  }, []);

  // 📦 Charger les commandes du backend
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const ordersData = await getAllOrders();
        console.log('📦 AdminDashboard - Commandes reçues du backend:', ordersData);
        setOrders(ordersData);
      } catch (err) {
        console.error("Erreur de chargement des commandes", err);
        toast.error("Impossible de charger les commandes");
      }
    };
    loadOrders();
  }, []);

  const resetForm = () => {
    setFormData({
      nom: '',
      prix: '',
      stock: '',
      description: '',
      categorie: '',
    });
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

  // ➕ Ajouter produit
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

  // ✏️ Modifier produit
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

  // ❌ Supprimer produit
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

  // 📋 Préparer la modification
  const openEditDialog = (product: Produit) => {
    setCurrentProduct(product);
    setFormData({
      nom: product.nom,
      prix: product.prix.toString(),
      stock: product.stock.toString(),
      description: product.description || '',
      categorie: product.categorie || '',
    });
    // Le mapper convertit imageUrl en image avec URL complète, mais on a besoin de l'URL complète pour l'aperçu
    setImagePreview(product.image || '');
    setIsEditDialogOpen(true);
  };

  // ⚙️ Solde produit
  const openSaleDialog = (product: Produit) => {
    setCurrentProduct(product);
    setSaleData({
      pourcentageSolde: product.pourcentageSolde?.toString() || '',
    });
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
      // Utiliser l'API applySale qui préserve toutes les propriétés du produit
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

  // 📦 Order management functions
  const openShipDialog = (order: Order) => {
    setCurrentOrder(order);
    setShipData({ numeroSuivi: '', transporteur: 'DHL' });
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

    try {
      await shipOrder(currentOrder.id, {
        numeroSuivi: shipData.numeroSuivi,
        transporteur: shipData.transporteur,
        utilisateur: 'Admin'
      });

      // Refresh orders
      const ordersData = await getAllOrders();
      setOrders(ordersData);

      toast.success("Commande marquée comme expédiée");
      setIsShipDialogOpen(false);
      setCurrentOrder(null);
    } catch (err) {
      console.error("Erreur lors de l'expédition:", err);
      toast.error("Erreur lors de l'expédition de la commande");
    }
  };

  const handleUpdateStatus = async () => {
    if (!currentOrder || !statusData.statut) {
      toast.error("Statut requis");
      return;
    }

    try {
      await updateOrderStatus(currentOrder.id, {
        statut: statusData.statut,
        commentaire: statusData.commentaire,
        utilisateur: 'Admin'
      });

      // Refresh orders
      const ordersData = await getAllOrders();
      setOrders(ordersData);

      toast.success("Statut mis à jour");
      setIsStatusDialogOpen(false);
      setCurrentOrder(null);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleDeliverOrder = async (order: Order) => {
    try {
      await deliverOrder(order.id, {
        utilisateur: 'Admin'
      });

      // Refresh orders
      const ordersData = await getAllOrders();
      setOrders(ordersData);

      toast.success("Commande marquée comme livrée");
    } catch (err) {
      console.error("Erreur lors de la livraison:", err);
      toast.error("Erreur lors de la livraison de la commande");
    }
  };

  const handleCancelOrder = async (order: Order) => {
    const reason = prompt("Raison de l'annulation:");
    if (!reason) return;

    try {
      await cancelOrder(order.id, {
        raison: reason,
        utilisateur: 'Admin'
      });

      // Refresh orders
      const ordersData = await getAllOrders();
      setOrders(ordersData);

      toast.success("Commande annulée");
    } catch (err) {
      console.error("Erreur lors de l'annulation:", err);
      toast.error("Erreur lors de l'annulation de la commande");
    }
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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl">Panneau d'administration</h1>
              <p className="text-sm text-gray-600">Gérez votre catalogue de produits</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Actions */}
            <div className="mb-6">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
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
                        onValueChange={(value : any) => setFormData({ ...formData, categorie: value })}
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
                  <Button type="submit">Ajouter</Button>
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
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
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
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Livrer
                                </Button>
                              )}
                              {order.statut !== 'DELIVERED' && order.statut !== 'CANCELLED' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleCancelOrder(order)}
                                >
                                  Annuler
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
          </TabsContent>
        </Tabs>

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
                <Input
                  id="tracking-number"
                  value={shipData.numeroSuivi}
                  onChange={(e) => setShipData({ ...shipData, numeroSuivi: e.target.value })}
                  placeholder="ex: 1Z999AA1234567890"
                  required
                />
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsShipDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="button" onClick={handleShipOrder}>
                Marquer comme expédiée
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
              <Button type="button" onClick={handleUpdateStatus}>
                Mettre à jour
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
