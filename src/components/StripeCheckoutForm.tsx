import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Lock, CreditCard } from 'lucide-react';

interface StripeCheckoutFormProps {
  amount: number;
  onSuccess: (paymentMethod: any) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

export const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  amount,
  onSuccess,
  onError,
  isProcessing,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setError('Card element not found');
      return;
    }

    setError(null);

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message || 'Payment method creation failed');
        onError(paymentMethodError.message || 'Payment method creation failed');
        return;
      }

      onSuccess(paymentMethod);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="h-5 w-5 text-green-600" />
        <h2 className="text-xl">Paiement sécurisé avec Stripe</h2>
      </div>

      {/* Card Number */}
      <div>
        <Label htmlFor="cardNumber">Numéro de carte *</Label>
        <div className="mt-1 p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <CardNumberElement
            id="cardNumber"
            options={CARD_ELEMENT_OPTIONS}
            className="w-full"
          />
        </div>
      </div>

      {/* Card Expiry and CVC */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiry">Date d'expiration *</Label>
          <div className="mt-1 p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <CardExpiryElement
              id="expiry"
              options={CARD_ELEMENT_OPTIONS}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="cvc">CVV *</Label>
          <div className="mt-1 p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <CardCvcElement
              id="cvc"
              options={CARD_ELEMENT_OPTIONS}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Security Notice */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Paiement 100% sécurisé</p>
            <p>Vos informations bancaires sont cryptées et ne sont jamais stockées sur nos serveurs. Stripe respecte les normes PCI DSS.</p>
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full gap-2"
        size="lg"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          'Traitement en cours...'
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Payer {amount.toFixed(2)} TND
          </>
        )}
      </Button>
    </form>
  );
};