import React, { useEffect, useState } from 'react';
import { CheckCircle, Mail, Package, Truck, Home, Download, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';

interface PaymentSuccessProps {
  onReturnHome: () => void;
  onViewOrderTracking: (orderId: number) => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  onReturnHome,
  onViewOrderTracking,
}) => {
  const [orderId, setOrderId] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (sessionId) {
        try {
          console.log('PaymentSuccess: Verifying payment for session:', sessionId);
          const response = await fetch(`http://localhost:8081/api/paiements/checkout-success?session_id=${sessionId}`);
          const data = await response.json();

          console.log('PaymentSuccess: Verification response:', data);

          if (data.success) {
            setOrderId(data.orderId);
          } else {
            setVerificationError(data.error || 'Payment verification failed');
          }
        } catch (error) {
          console.error('PaymentSuccess: Error verifying payment:', error);
          setVerificationError('Unable to verify payment. Please contact support.');
        }
      } else {
        setVerificationError('No payment session found');
      }

      setIsVerifying(false);
    };

    verifyPayment();
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl mb-2">Vérification du paiement...</h2>
          <p className="text-gray-600">Veuillez patienter pendant que nous confirmons votre paiement.</p>
        </Card>
      </div>
    );
  }

  if (verificationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl mb-2">Erreur de vérification</h2>
          <p className="text-gray-600 mb-4">{verificationError}</p>
          <Button onClick={onReturnHome}>Retour à l'accueil</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-14 w-14 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Paiement réussi ! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Votre commande a été payée avec succès
            </p>
            {orderId && (
              <p className="text-lg text-blue-600 font-semibold">
                Numéro de commande: #{orderId.toString().padStart(6, '0')}
              </p>
            )}
          </div>

          {/* Payment Summary Card */}
          <Card className="p-8 mb-8 bg-white shadow-lg">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Transaction approuvée
              </h2>
              <p className="text-gray-600">
                Votre paiement a été traité en toute sécurité via Stripe
              </p>
            </div>

            <Separator className="my-6" />

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
                <div className="text-sm font-medium text-gray-900">Paiement confirmé</div>
                <div className="text-xs text-gray-500">Transaction sécurisée</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">📧</div>
                <div className="text-sm font-medium text-gray-900">Email envoyé</div>
                <div className="text-xs text-gray-500">Confirmation automatique</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 mb-1">📦</div>
                <div className="text-sm font-medium text-gray-900">Commande préparée</div>
                <div className="text-xs text-gray-500">Traitement en cours</div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-8 mb-8">
            <h3 className="text-2xl font-semibold mb-6 text-center">Prochaines étapes</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1">Confirmation par email</h4>
                  <p className="text-gray-600">
                    Un email de confirmation avec les détails de votre commande vous a été envoyé.
                    Vérifiez votre boîte de réception (et vos spams).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1">Préparation de commande</h4>
                  <p className="text-gray-600">
                    Notre équipe prépare votre commande. Vous recevrez un email de suivi dès l'expédition.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1">Livraison</h4>
                  <p className="text-gray-600">
                    Livraison estimée sous 2-3 jours ouvrés. Suivi disponible dans votre compte.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {orderId && (
              <Button
                size="lg"
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => onViewOrderTracking(orderId)}
              >
                <Truck className="h-5 w-5" />
                Suivre ma commande
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => window.print()}
            >
              <Download className="h-5 w-5" />
              Imprimer la confirmation
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={onReturnHome}
            >
              <Home className="h-5 w-5" />
              Retour à l'accueil
            </Button>
          </div>

          {/* Support Info */}
          <Card className="p-6 mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Besoin d'aide ?</h3>
              <p className="text-gray-600 mb-4">
                Notre équipe support est disponible pour répondre à vos questions.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <a href="mailto:support@techstore.com" className="text-blue-600 hover:underline flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  support@techstore.com
                </a>
                <a href="tel:+21612345678" className="text-blue-600 hover:underline flex items-center gap-1">
                  📞 +216 12 345 678
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};