import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Lock, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Client } from '../types';
import { toast } from 'sonner';
import { createClient, createPaiement, createCommande, envoyerEmailCommande } from '../api/orderApi';

interface CheckoutProps {
  onBack: () => void;
  onOrderComplete: (client: Client, orderId: number) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onBack, onOrderComplete }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [clientInfo, setClientInfo] = useState<Partial<Client>>({
    nom: '',
    email: '',
    telephone: '',
  });

  // Payment info is now handled by Stripe Elements

  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'tunisie',
  });

  const subtotal = getCartTotal();
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = subtotal * 0.2;
  const total = subtotal + shipping;

  const handleClientInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientInfo.nom || !clientInfo.email || !clientInfo.telephone) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    setStep(2);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    setStep(3);
  };

  const handleStripeCheckout = async () => {
    setIsProcessing(true);

    try {
      // 1. Créer le client (inclure l'adresse de livraison)
      const clientData = {
        nom: clientInfo.nom,
        email: clientInfo.email,
        telephone: clientInfo.telephone,
        // Le backend Java attend une entité AdresseLivraison imbriquée
        adresseLivraison: {
          rue: shippingAddress.address,
          ville: shippingAddress.city,
          codePostal: shippingAddress.postalCode,
          pays: shippingAddress.country,
        },
      };

      const createdClient = await createClient(clientData);
      console.log('✅ Client créé:', createdClient);

      // 2. Créer la commande
      const lignesCommande = cartItems.map((item) => ({
        quantite: item.quantite,
        prixUnitaire: item.produit.prix,
        produit: {
          id: item.produit.idProd,
        },
      }));

      const commandeData = {
        clientId: createdClient.id,
        total: total,
        lignesCommande: lignesCommande,
      };

      const createdCommande = await createCommande(commandeData);
      console.log('✅ Commande créée:', createdCommande);

      // 3. Créer une session Stripe Checkout
      const checkoutData = {
        commandeId: createdCommande.id || createdCommande.idCommande,
        amount: total,
        currency: 'usd', // Stripe supports USD, EUR, etc. but not TND directly
        successUrl: `http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `http://localhost:3000/checkout`,
      };

      // Créer la session de paiement via le backend
      const response = await fetch('http://localhost:8081/api/paiements/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session de paiement');
      }

      const session = await response.json();

      // Rediriger vers Stripe Checkout
      window.location.href = session.url;

    } catch (error: any) {
      console.error('❌ Erreur lors de l\'initialisation du paiement:', error);
      toast.error('Erreur lors de l\'initialisation du paiement', {
        description: error?.message || 'Veuillez réessayer',
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Button variant="ghost" className="mb-6 gap-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Retour au panier
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl mb-4">Finaliser votre commande</h1>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= s
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s ? <Check className="h-5 w-5" /> : s}
                  </div>
                  <span className="text-xs text-gray-600">
                    {s === 1 && 'Informations'}
                    {s === 2 && 'Livraison'}
                    {s === 3 && 'Paiement'}
                  </span>
                </div>
                {s < 3 && (
                  <div
                    className={`h-0.5 w-20 ${
                      step > s ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {/* Step 1: Client Info */}
              {step === 1 && (
                <form onSubmit={handleClientInfoSubmit} className="space-y-4">
                  <h2 className="text-xl mb-4">Informations personnelles</h2>
                  
                  <div>
                    <Label htmlFor="nom">Nom complet *</Label>
                    <Input
                      id="nom"
                      type="text"
                      value={clientInfo.nom}
                      onChange={(e) => setClientInfo({ ...clientInfo, nom: e.target.value })}
                      placeholder="youssef ben foulen"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="telephone">Téléphone *</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      value={clientInfo.telephone}
                      onChange={(e) => setClientInfo({ ...clientInfo, telephone: e.target.value })}
                      placeholder="+216 12 345 678"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Continuer
                  </Button>
                </form>
              )}

              {/* Step 2: Shipping */}
              {step === 2 && (
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <h2 className="text-xl mb-4">Adresse de livraison</h2>

                  <div>
                    <Label htmlFor="address">Adresse *</Label>
                    <Input
                      id="address"
                      type="text"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      placeholder="123 Rue de la tunisie"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        placeholder="mourouj"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="postalCode">Code postal *</Label>
                      <Input
                        id="postalCode"
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                        placeholder="4071"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      type="text"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      placeholder="TUNISIE"
                      disabled
                      
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Retour
                    </Button>
                    <Button type="submit" className="flex-1" size="lg">
                      Continuer
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="h-5 w-5 text-green-600" />
                    <h2 className="text-xl">Paiement sécurisé avec Stripe</h2>
                  </div>

                  <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <CreditCard className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Paiement Stripe Sécurisé
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Vous serez redirigé vers une page de paiement Stripe sécurisée pour compléter votre achat.
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {total.toFixed(2)} TND
                        </div>
                        <div className="text-sm text-gray-500">
                          Montant total de la commande
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-start gap-2">
                      <Lock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-900">
                        <p className="font-medium mb-1">Paiement 100% sécurisé</p>
                        <p>Stripe protège vos informations bancaires et respecte les normes PCI DSS.</p>
                      </div>
                    </div>
                  </Card>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Retour
                    </Button>
                    <Button
                      onClick={handleStripeCheckout}
                      className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        'Redirection en cours...'
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          Payer avec Stripe
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="mb-4">Récapitulatif de commande</h3>

              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.produit.idProd} className="flex justify-between text-sm">
                    <span className="flex-1">
                      {item.produit.nom} × {item.quantite}
                    </span>
                    <span>{(item.produit.prix * item.quantite).toFixed(2)} TND</span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (20%)</span>
                  <span>{tax.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>
                    {shipping === 0 ? (
                      <Badge variant="secondary" className="text-xs">Gratuite</Badge>
                    ) : (
                      `${shipping.toFixed(2)} TND`
                    )}
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                <span className="text-lg">Total</span>
                <span className="text-2xl text-blue-600">{total.toFixed(2)} TND</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
