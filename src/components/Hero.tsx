import React from 'react';
import { ShoppingBag, TrendingUp, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export const Hero: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl mb-6">
            Découvrez les meilleurs produits tech
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Smartphones, ordinateurs, accessoires et bien plus encore. Livraison rapide et garantie 2 ans.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button size="lg" variant="secondary" className="gap-2">
              <ShoppingBag className="h-5 w-5" />
              Découvrir nos produits
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white text-white">
              Promotions du moment
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-2">Livraison Express</h3>
              <p className="text-sm text-blue-100">
                Recevez vos produits en 2-3 jours ouvrés partout en TUNISIE
              </p>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="mb-2">Paiement Sécurisé</h3>
              <p className="text-sm text-blue-100">
                Transactions cryptées et protection de vos données
              </p>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mb-2">Garantie 2 ans</h3>
              <p className="text-sm text-blue-100">
                Tous nos produits sont garantis avec un SAV réactif
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
