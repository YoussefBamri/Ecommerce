import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, ArrowLeft, RefreshCw, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getOrderTracking, getOrderHistory } from '../api/api';

interface OrderTrackingProps {
   orderId: number | null;
   onOrderFound?: (orderId: number) => void;
   onBack: () => void;
}

interface TrackingInfo {
  commandeId: number;
  statut: string;
  numeroSuivi: string | null;
  transporteur: string | null;
  dateExpedition: string | null;
  dateLivraisonEstimee: string | null;
  dateLivraisonReelle: string | null;
  notesLivraison: string | null;
}

interface StatusHistory {
  id: number;
  ancienStatut: string | null;
  nouveauStatut: string;
  dateChangement: string;
  commentaire: string | null;
  utilisateur: string | null;
}

const statusConfig = {
  PENDING: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    step: 1
  },
  CONFIRMED: {
    label: 'Confirmée',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    step: 2
  },
  PROCESSING: {
    label: 'En préparation',
    color: 'bg-purple-100 text-purple-800',
    icon: Package,
    step: 3
  },
  SHIPPED: {
    label: 'Expédiée',
    color: 'bg-indigo-100 text-indigo-800',
    icon: Truck,
    step: 4
  },
  DELIVERED: {
    label: 'Livrée',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    step: 5
  },
  CANCELLED: {
    label: 'Annulée',
    color: 'bg-red-100 text-red-800',
    icon: Clock,
    step: 0
  }
};

export const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId: initialOrderId, onOrderFound, onBack }) => {
   const [orderId, setOrderId] = useState<number | null>(initialOrderId);
   const [inputOrderId, setInputOrderId] = useState('');
   const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
   const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [showInputForm, setShowInputForm] = useState(!initialOrderId);

  const loadTrackingData = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const [trackingResponse, historyResponse] = await Promise.all([
        getOrderTracking(id),
        getOrderHistory(id)
      ]);

      setTrackingInfo(trackingResponse);
      setStatusHistory(historyResponse);
      setOrderId(id);
      setShowInputForm(false);

      if (onOrderFound) {
        onOrderFound(id);
      }
    } catch (err: any) {
      console.error('Error loading tracking data:', err);
      setError('Impossible de charger les informations de suivi. Veuillez vérifier le numéro de commande.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = () => {
    const id = parseInt(inputOrderId.trim());
    if (isNaN(id) || id <= 0) {
      setError('Veuillez entrer un numéro de commande valide.');
      return;
    }
    loadTrackingData(id);
  };

  useEffect(() => {
    if (initialOrderId) {
      loadTrackingData(initialOrderId);
    }
  }, [initialOrderId]);

  const getCurrentStep = () => {
    if (!trackingInfo) return 0;
    const config = statusConfig[trackingInfo.statut as keyof typeof statusConfig];
    return config ? config.step : 0;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show input form when no order ID is provided
  if (showInputForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="p-8">
              <div className="text-center mb-6">
                <Package className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h1 className="text-2xl mb-2">Suivre ma commande</h1>
                <p className="text-gray-600">Entrez votre numéro de commande</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="order-id">Numéro de commande</Label>
                  <Input
                    id="order-id"
                    type="number"
                    placeholder="ex: 123456"
                    value={inputOrderId}
                    onChange={(e) => setInputOrderId(e.target.value)}
                    className="text-center text-lg"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleTrackOrder}
                  className="w-full"
                  disabled={loading || !inputOrderId.trim()}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Recherche...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Suivre ma commande
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-6 text-center">
                <Button onClick={onBack} variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Chargement des informations de suivi...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trackingInfo) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center">
              <div className="text-red-600 mb-4">
                <Package className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-xl mb-2">Erreur de chargement</h2>
              <p className="text-gray-600 mb-6">{error || 'Informations non disponibles'}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={loadTrackingData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
                <Button onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStep();
  const currentStatusConfig = statusConfig[trackingInfo.statut as keyof typeof statusConfig];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button onClick={onBack} variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-3xl mb-2">Suivi de commande</h1>
            <p className="text-gray-600">Commande #{orderId?.toString().padStart(6, '0')}</p>
          </div>

          {/* Status Overview */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {currentStatusConfig && <currentStatusConfig.icon className="h-6 w-6 text-blue-600" />}
                <div>
                  <h2 className="text-xl">Statut actuel</h2>
                  <Badge className={currentStatusConfig?.color}>
                    {currentStatusConfig?.label}
                  </Badge>
                </div>
              </div>
              <Button onClick={loadTrackingData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Commande</span>
                <span>Confirmation</span>
                <span>Préparation</span>
                <span>Expédition</span>
                <span>Livraison</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Tracking Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Numéro de suivi</p>
                <p className="font-mono text-lg">
                  {trackingInfo.numeroSuivi || <span className="text-gray-400">Non défini</span>}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Transporteur</p>
                <p>{trackingInfo.transporteur || <span className="text-gray-400">Non défini</span>}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Date d'expédition</p>
                <p>{formatDate(trackingInfo.dateExpedition)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Livraison estimée</p>
                <p>{formatDate(trackingInfo.dateLivraisonEstimee)}</p>
              </div>
              {trackingInfo.dateLivraisonReelle && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Date de livraison</p>
                  <p className="text-green-600 font-medium">{formatDate(trackingInfo.dateLivraisonReelle)}</p>
                </div>
              )}
            </div>

            {trackingInfo.notesLivraison && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  {trackingInfo.notesLivraison}
                </p>
              </div>
            )}
          </Card>

          {/* Status History */}
          <Card className="p-6">
            <h3 className="text-xl mb-4">Historique des statuts</h3>
            <div className="space-y-4">
              {statusHistory.map((history, index) => {
                const statusConfigItem = statusConfig[history.nouveauStatut as keyof typeof statusConfig];
                const IconComponent = statusConfigItem?.icon || Clock;

                return (
                  <div key={history.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`h-5 w-5 ${
                          index === 0 ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          {statusConfigItem?.label || history.nouveauStatut}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(history.dateChangement)}
                        </span>
                      </div>
                      {history.commentaire && (
                        <p className="text-sm text-gray-600 mt-1">{history.commentaire}</p>
                      )}
                      {history.utilisateur && (
                        <p className="text-xs text-gray-400 mt-1">Par: {history.utilisateur}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Support Info */}
          <Card className="p-6 mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <h3 className="mb-2">Besoin d'aide ?</h3>
            <p className="text-sm text-gray-700 mb-4">
              Notre équipe support est disponible pour vous aider avec votre commande.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="mailto:support@techstore.com" className="text-blue-600 hover:underline">
                support@techstore.com
              </a>
              <span className="text-gray-400">|</span>
              <a href="tel:+33123456789" className="text-blue-600 hover:underline">
                +33 1 23 45 67 89
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};