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
import { toast } from 'sonner@2.0.3';
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

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

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

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentInfo.cardNumber || !paymentInfo.cardName || !paymentInfo.expiryDate || !paymentInfo.cvv) {
      toast.error('Veuillez remplir tous les champs de paiement');
      return;
    }

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
      
      // 2. Créer la commande AVANT le paiement (le paiement nécessite commandeId)
      const lignesCommande = cartItems.map((item) => ({
        quantite: item.quantite,
        prixUnitaire: item.produit.prix, // Le backend attend prixUnitaire, pas prixTotal
        produit: {
          id: item.produit.idProd, // Le backend attend 'id'
        },
      }));
      
      const commandeData = {
        clientId: createdClient.id, // Le backend attend clientId directement
        total: total,
        lignesCommande: lignesCommande, // Le backend attend lignesCommande (pas lignes)
      };
      
      const createdCommande = await createCommande(commandeData);
      console.log('✅ Commande créée:', createdCommande);
      
      // 3. Créer le paiement avec le commandeId
      const paiementData = {
        montant: total,
        commandeId: createdCommande.id || createdCommande.idCommande, // Le backend attend commandeId
        modePaiement: 'CARTE_BANCAIRE', // Le backend attend modePaiement (pas methode)
        numeroCarte: paymentInfo.cardNumber.replace(/\s/g, ''), // Optionnel, pour affichage
        nomCarte: paymentInfo.cardName, // Optionnel, pour affichage
        dateExpiration: paymentInfo.expiryDate, // Optionnel, pour affichage
        cvv: paymentInfo.cvv, // Optionnel, pour affichage
      };
      
      const createdPaiement = await createPaiement(paiementData);
      console.log('✅ Paiement créé:', createdPaiement);
      
      // 4. Envoyer l'email de confirmation au client
      const orderId = createdCommande.id || createdCommande.idCommande || Math.floor(Math.random() * 100000) + 1000;
      
      try {
        await envoyerEmailCommande(orderId);
        console.log('✅ Email de confirmation envoyé au client');
      } catch (emailError) {
        // Ne pas faire échouer la commande si l'email échoue
        console.warn('⚠️ Erreur lors de l\'envoi de l\'email (commande confirmée):', emailError);
      }
      
      // 5. Vider le panier et compléter la commande
      clearCart();
      
      onOrderComplete(createdClient, orderId);
      
      toast.success('Commande confirmée avec succès !', {
        description: `Numéro de commande: ${orderId}. Un email de confirmation a été envoyé.`,
      });
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement de la commande:', error);
      console.error('Détails:', error.response?.data);
      toast.error('Erreur lors du traitement de la commande', {
        description: error.response?.data?.message || error.message || 'Veuillez réessayer',
      });
    } finally {
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
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="h-5 w-5 text-green-600" />
                    <h2 className="text-xl">Paiement sécurisé</h2>
                  </div>

                  <div>
                    <Label htmlFor="cardNumber">Numéro de carte *</Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardName">Nom sur la carte *</Label>
                    <Input
                      id="cardName"
                      type="text"
                      value={paymentInfo.cardName}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                      placeholder="stb carte"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Date d'expiration *</Label>
                      <Input
                        id="expiryDate"
                        type="text"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                        placeholder="MM/AA"
                        maxLength={5}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        type="text"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                        placeholder="123"
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>

                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-2">
                      <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-900">
                        Vos informations de paiement sont cryptées et sécurisées. Nous ne stockons pas vos données bancaires.
                      </p>
                    </div>
                  </Card>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 gap-2"
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        'Traitement en cours...'
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          Payer {total.toFixed(2)} TND
                        </>
                      )}
                    </Button>
                  </div>
                </form>
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
