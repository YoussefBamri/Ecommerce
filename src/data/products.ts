import { Produit } from "../types";

export const products: Produit[] = [
  {
    idProd: 1,
    nom: "iPhone 15 Pro Max",
    prix: 999.99,
    prixOriginal: 1299.99,
    enSolde: true,
    pourcentageSolde: 23,
    stock: 45,
    image: "https://images.unsplash.com/photo-1761645337339-9bf0697f3b0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzbWFydHBob25lfGVufDF8fHx8MTc2MjE5MDQ4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Le smartphone le plus avancé avec puce A17 Pro, caméra 48MP et écran Super Retina XDR de 6.7 pouces. Design en titane premium.",
    categorie: "Smartphones"
  },
  {
    idProd: 2,
    nom: "MacBook Pro 16\"",
    prix: 2499.99,
    stock: 23,
    image: "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjIxNjA4OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Puissance extrême avec la puce M3 Pro, 18Go de RAM, SSD 512Go. Parfait pour les créateurs et professionnels.",
    categorie: "Ordinateurs"
  },
  {
    idProd: 3,
    nom: "AirPods Pro 2",
    prix: 279.99,
    stock: 89,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGhlYWRwaG9uZXN8ZW58MXx8fHwxNzYyMjAyNDM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Réduction de bruit active 2x plus puissante, audio spatial personnalisé, autonomie jusqu'à 30 heures avec le boîtier.",
    categorie: "Audio"
  },
  {
    idProd: 4,
    nom: "Apple Watch Ultra 2",
    prix: 849.99,
    stock: 34,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMHdhdGNofGVufDF8fHx8MTc2MjE3NTg2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Montre connectée tout-terrain avec écran 49mm, GPS double fréquence, étanchéité 100m, autonomie 36 heures.",
    categorie: "Montres"
  },
  {
    idProd: 5,
    nom: "Canon EOS R6 Mark II",
    prix: 2899.99,
    stock: 12,
    image: "https://images.unsplash.com/photo-1579535984712-92fffbbaa266?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcmElMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3NjIyMTEwNDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Appareil photo hybride 24.2MP avec stabilisation 8 stops, autofocus intelligent, vidéo 4K 60fps.",
    categorie: "Photo & Vidéo"
  },
  {
    idProd: 6,
    nom: "iPad Pro 12.9\" M2",
    prix: 1449.99,
    stock: 56,
    image: "https://images.unsplash.com/photo-1672239069328-dd1535c0d78a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWJsZXQlMjBkZXZpY2V8ZW58MXx8fHwxNzYyMjIwOTcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Tablette ultra-puissante avec écran Liquid Retina XDR, puce M2, compatible Apple Pencil et Magic Keyboard.",
    categorie: "Tablettes"
  },
  {
    idProd: 7,
    nom: "PlayStation 5 Pro",
    prix: 699.99,
    stock: 28,
    image: "https://images.unsplash.com/photo-1604846887565-640d2f52d564?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBjb25zb2xlfGVufDF8fHx8MTc2MjIzNjc5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Console de jeu nouvelle génération, SSD ultra-rapide, ray tracing, 4K 120fps, manette DualSense incluse.",
    categorie: "Gaming"
  },
  {
    idProd: 8,
    nom: "Bose SoundLink Flex",
    prix: 149.99,
    stock: 67,
    image: "https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVldG9vdGglMjBzcGVha2VyfGVufDF8fHx8MTc2MjE2NjIyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Enceinte Bluetooth portable résistante à l'eau et aux chocs, son puissant 360°, autonomie 12 heures.",
    categorie: "Audio"
  },
  {
    idProd: 9,
    nom: "Samsung Galaxy S24 Ultra",
    prix: 1399.99,
    stock: 41,
    image: "https://images.unsplash.com/photo-1761645337339-9bf0697f3b0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzbWFydHBob25lfGVufDF8fHx8MTc2MjE5MDQ4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Smartphone premium Android avec S Pen intégré, zoom optique 100x, écran Dynamic AMOLED 6.8 pouces.",
    categorie: "Smartphones"
  },
  {
    idProd: 10,
    nom: "Dell XPS 15",
    prix: 1899.99,
    stock: 19,
    image: "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjIxNjA4OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Ordinateur portable haute performance, Intel Core i7 13ème gen, RTX 4060, écran OLED 4K touch.",
    categorie: "Ordinateurs"
  },
  {
    idProd: 11,
    nom: "Sony WH-1000XM5",
    prix: 299.99,
    prixOriginal: 399.99,
    enSolde: true,
    pourcentageSolde: 25,
    stock: 52,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGhlYWRwaG9uZXN8ZW58MXx8fHwxNzYyMjAyNDM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Casque audio haut de gamme avec meilleure réduction de bruit du marché, autonomie 30h, son Hi-Res.",
    categorie: "Audio"
  },
  {
    idProd: 12,
    nom: "Garmin Fenix 7X Solar",
    prix: 949.99,
    stock: 15,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMHdhdGNofGVufDF8fHx8MTc2MjE3NTg2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Montre GPS multisport avec recharge solaire, cartographie intégrée, suivi santé avancé, durabilité militaire.",
    categorie: "Montres"
  }
];
