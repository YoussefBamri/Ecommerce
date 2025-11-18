import React from 'react';
import { CheckCircle, Mail, Package, Home, Truck } from 'lucide-react';
import { Client } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';

interface OrderConfirmationProps {
  client: Client;
  orderId: number;
  onReturnHome: () => void;
  onViewTracking: () => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  client,
  orderId,
  onReturnHome,
  onViewTracking,
}) => {
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl mb-2">Commande confirmée !</h1>
            <p className="text-gray-600">
              Merci pour votre achat. Votre commande a été traitée avec succès.
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm text-gray-500 mb-2">Numéro de commande</h3>
                <p className="text-xl">#{orderId.toString().padStart(6, '0')}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500 mb-2">Date de commande</h3>
                <p className="text-xl">
                  {new Date().toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="mb-4">Informations de livraison</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Client</p>
                  <p>{client.nom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p>{client.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                  <p>{client.telephone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Livraison estimée</p>
                  <p>
                    {estimatedDelivery.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-6 mb-6">
            <h3 className="mb-4">Prochaines étapes</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="mb-1">Confirmation par email</h4>
                  <p className="text-sm text-gray-600">
                    Un email de confirmation a été envoyé à {client.email} avec les détails de votre commande.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="mb-1">Préparation de la commande</h4>
                  <p className="text-sm text-gray-600">
                    Votre commande est en cours de préparation dans notre entrepôt. Vous recevrez un email de suivi dès l'expédition.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Home className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="mb-1">Livraison</h4>
                  <p className="text-sm text-gray-600">
                    Votre commande sera livrée dans 2-3 jours ouvrés. Livraison suivie avec notification.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Support Info */}
          <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <h3 className="mb-2">Besoin d'aide ?</h3>
            <p className="text-sm text-gray-700 mb-4">
              Notre équipe support est disponible 7j/7 pour répondre à vos questions.
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="flex-1" onClick={onViewTracking}>
              <Truck className="h-4 w-4 mr-2" />
              Suivre ma commande
            </Button>
            <Button size="lg" variant="outline" className="flex-1" onClick={onReturnHome}>
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
            <Button size="lg" variant="outline" className="flex-1" onClick={() => window.print()}>
              Imprimer la confirmation
            </Button>
          </div>

          {/* Thank You Message */}
          <div className="text-center mt-8 p-6 bg-white rounded-lg border">
            <p className="text-gray-600">
              Merci de votre confiance ! Nous espérons vous revoir bientôt sur TechStore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
