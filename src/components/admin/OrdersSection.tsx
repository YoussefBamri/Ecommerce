import React, { useState } from 'react';
import { Truck, CheckCircle, Clock, Package, RefreshCw, Shuffle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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

interface OrdersSectionProps {
  orders: Order[];
  drivers: Driver[];
  loadingStates: any;
  onShipOrder: (orderId: number, shippingData: any) => Promise<void>;
  onUpdateOrderStatus: (orderId: number, statusData: any) => Promise<void>;
  onDeliverOrder: (orderId: number) => Promise<void>;
  onCancelOrder: (orderId: number) => Promise<void>;
}

export const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders,
  drivers,
  loadingStates,
  onShipOrder,
  onUpdateOrderStatus,
  onDeliverOrder,
  onCancelOrder
}) => {
  const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const [shipData, setShipData] = useState({
    numeroSuivi: '',
    transporteur: 'DHL',
    notesLivraison: '',
    driverId: ''
  });
  const [statusData, setStatusData] = useState({ statut: '', commentaire: '' });

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
      return;
    }

    try {
      await onShipOrder(currentOrder.id, {
        numeroSuivi: shipData.numeroSuivi,
        transporteur: shipData.transporteur,
        notesLivraison: shipData.notesLivraison,
        driverId: shipData.driverId ? parseInt(shipData.driverId) : null,
        utilisateur: 'Admin'
      });
      setIsShipDialogOpen(false);
      setCurrentOrder(null);
    } catch (err) {
      console.error("Erreur lors de l'expédition:", err);
    }
  };

  const handleUpdateStatus = async () => {
    if (!currentOrder || !statusData.statut) {
      return;
    }

    try {
      await onUpdateOrderStatus(currentOrder.id, {
        statut: statusData.statut,
        commentaire: statusData.commentaire,
        utilisateur: 'Admin'
      });
      setIsStatusDialogOpen(false);
      setCurrentOrder(null);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
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
                            onClick={() => onDeliverOrder(order.id)}
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
                            onClick={() => onCancelOrder(order.id)}
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
                      onClick={() => setShipData(prev => ({ ...prev, numeroSuivi: '' }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                      title="Effacer le numéro de suivi"
                    >
                      ×
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
    </div>
  );
};