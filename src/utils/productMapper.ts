import { Produit } from '../types';

export const mapBackendToFrontend = (backendProduct: any): Produit => {
  if (!backendProduct) {
    throw new Error('Produit backend est null ou undefined');
  }

  const baseUrl = 'http://localhost:8081';
  const imageUrl = backendProduct.imageUrl 
    ? (backendProduct.imageUrl.startsWith('http') 
        ? backendProduct.imageUrl 
        : `${baseUrl}${backendProduct.imageUrl}`)
    : undefined;

  // Check if product has a sale (prixSolde exists)
  const hasSale = backendProduct.prixSolde != null && backendProduct.reduction != null;
  
  const mapped: Produit = {
    idProd: backendProduct.id || backendProduct.idProd, // Support both formats
    nom: backendProduct.nom || 'Produit sans nom',
    prix: hasSale ? (backendProduct.prixSolde || 0) : (backendProduct.prix || 0),
    prixOriginal: hasSale ? (backendProduct.prix || undefined) : undefined,
    enSolde: hasSale,
    pourcentageSolde: backendProduct.reduction || undefined,
    stock: backendProduct.stock || 0,
    image: imageUrl,
    description: backendProduct.description || '',
    categorie: backendProduct.categorie || 'Autres',
  };

  return mapped;
};

