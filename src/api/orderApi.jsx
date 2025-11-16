import axios from "axios";

const BASE_URL = "http://localhost:8081/api";

// 🔹 Créer un client
export const createClient = async (clientData) => {
  try {
    const res = await axios.post(`${BASE_URL}/clients`, clientData);
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la création du client:", error);
    throw error;
  }
};

// 🔹 Créer un paiement
export const createPaiement = async (paiementData) => {
  try {
    const res = await axios.post(`${BASE_URL}/paiements`, paiementData);
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la création du paiement:", error);
    throw error;
  }
};

// 🔹 Créer une commande
export const createCommande = async (commandeData) => {
  try {
    const res = await axios.post(`${BASE_URL}/commandes`, commandeData);
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    throw error;
  }
};

// 🔹 Récupérer toutes les commandes
export const fetchCommandes = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/commandes`);
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    throw error;
  }
};

// 🔹 Récupérer une commande par ID
export const getCommandeById = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}/commandes/${id}`);
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la commande:", error);
    throw error;
  }
};

// 🔹 Envoyer un email de confirmation de commande au client
export const envoyerEmailCommande = async (commandeId) => {
  try {
    const res = await axios.post(`${BASE_URL}/commandes/${commandeId}/envoyer-email`);
    return res.data;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    // Ne pas faire échouer la commande si l'email échoue
    throw error;
  }
};

