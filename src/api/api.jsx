import axios from "axios";

const API_URL = "http://localhost:8081/api/produits"; // URL du backend Spring Boot
const ORDERS_API_URL = "http://localhost:8081/api/commandes"; // URL des commandes

// 🔹 Récupérer tous les produits
export const fetchProduits = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// 🔹 Ajouter un produit avec image
export const addProduitAvecImage = async (formData) => {
  // Debug - verify data
  console.log("=== API - FormData being sent ===");
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }
  
  const res = await axios.post(`${API_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateProduitAvecImage = async (id, formData) => {
  const res = await axios.put(`${API_URL}/${id}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🔹 Modifier un produit sans image (optionnel)
export const updateProduit = async (id, produit) => {
  const res = await axios.put(`${API_URL}/${id}`, produit);
  return res.data;
};

// 🔹 Supprimer un produit
export const deleteProduit = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};

// 🔹 Obtenir un produit par ID
export const getProduitById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

// 🔹 Appliquer une réduction
export const applySale = async (id, pourcentage) => {
  const res = await axios.put(`${API_URL}/${id}/solde/${pourcentage}`);
  return res.data;
};

// 🔹 Supprimer la réduction
export const removeSale = async (id) => {
  const res = await axios.put(`${API_URL}/${id}/solde/remove`);
  return res.data;
};

// 🔹 ORDER TRACKING API FUNCTIONS

// 🔹 Récupérer les informations de suivi d'une commande
export const getOrderTracking = async (orderId) => {
  const res = await axios.get(`${ORDERS_API_URL}/${orderId}/tracking`);
  return res.data;
};

// 🔹 Récupérer l'historique des statuts d'une commande
export const getOrderHistory = async (orderId) => {
  const res = await axios.get(`${ORDERS_API_URL}/${orderId}/history`);
  return res.data;
};

// 🔹 Récupérer une commande par ID
export const getOrderById = async (orderId) => {
  const res = await axios.get(`${ORDERS_API_URL}/${orderId}`);
  return res.data;
};

// 🔹 Récupérer toutes les commandes (pour admin)
export const getAllOrders = async () => {
  const res = await axios.get(ORDERS_API_URL);
  return res.data;
};

// 🔹 Mettre à jour le statut d'une commande (admin)
export const updateOrderStatus = async (orderId, payload) => {
  const res = await axios.put(`${ORDERS_API_URL}/${orderId}/status`, payload);
  return res.data;
};

// 🔹 Marquer une commande comme expédiée
export const shipOrder = async (orderId, payload) => {
  const res = await axios.post(`${ORDERS_API_URL}/${orderId}/ship`, payload);
  return res.data;
};

// 🔹 Marquer une commande comme livrée
export const deliverOrder = async (orderId, payload) => {
  const res = await axios.put(`${ORDERS_API_URL}/${orderId}/deliver`, payload);
  return res.data;
};

// 🔹 Annuler une commande
export const cancelOrder = async (orderId, payload) => {
  const res = await axios.post(`${ORDERS_API_URL}/${orderId}/cancel`, payload);
  return res.data;
};
