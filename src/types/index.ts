
export interface Client {
  id: number;
  nom: string;
  email: string;
  telephone: string;
}

export interface Produit {
  idProd: number;
  nom: string;
  prix: number;
  stock: number;
  image?: string;
  description?: string;
  categorie?: string;
  enSolde?: boolean;
  prixOriginal?: number;
  pourcentageSolde?: number;
}

export interface LigneCommande {
  id?: number;
  quantite: number;
  prixTotal: number;
  produit: Produit;
}

export interface Commande {
  id?: number;
  dateCommande: Date;
  client: Client;
  lignes: LigneCommande[];
}

export interface CartItem {
  produit: Produit;
  quantite: number;
}
