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

// 🔹 DRIVER API FUNCTIONS

// 🔹 Récupérer tous les chauffeurs
export const getAllDrivers = async () => {
  const res = await axios.get(`http://localhost:8081/api/drivers`);
  return res.data;
};

// 🔹 Récupérer les chauffeurs disponibles
export const getAvailableDrivers = async () => {
  const res = await axios.get(`http://localhost:8081/api/drivers/available`);
  return res.data;
};

// 🔹 Créer un chauffeur
export const createDriver = async (driver) => {
  const res = await axios.post(`http://localhost:8081/api/drivers`, driver);
  return res.data;
};

// 🔹 Mettre à jour un chauffeur
export const updateDriver = async (id, driver) => {
  const res = await axios.put(`http://localhost:8081/api/drivers/${id}`, driver);
  return res.data;
};

// 🔹 Supprimer un chauffeur
export const deleteDriver = async (id) => {
  const res = await axios.delete(`http://localhost:8081/api/drivers/${id}`);
  return res.data;
};

// 🔹 Changer la disponibilité d'un chauffeur
export const toggleDriverAvailability = async (id) => {
  const res = await axios.put(`http://localhost:8081/api/drivers/${id}/toggle-availability`);
  return res.data;
};

// 🔹 REVIEW API FUNCTIONS

const REVIEWS_API_URL = "http://localhost:8081/api/reviews";

// 🔹 Récupérer tous les avis d'un produit
export const getReviewsByProduct = async (productId) => {
  const res = await axios.get(`${REVIEWS_API_URL}/product/${productId}`);
  return res.data;
};

// 🔹 Récupérer un avis par ID
export const getReviewById = async (reviewId) => {
  const res = await axios.get(`${REVIEWS_API_URL}/${reviewId}`);
  return res.data;
};

// 🔹 Créer un nouvel avis
export const createReview = async (review) => {
  const res = await axios.post(REVIEWS_API_URL, review);
  return res.data;
};

// 🔹 Mettre à jour un avis
export const updateReview = async (reviewId, review) => {
  const res = await axios.put(`${REVIEWS_API_URL}/${reviewId}`, review);
  return res.data;
};

// 🔹 Supprimer un avis
export const deleteReview = async (reviewId) => {
  await axios.delete(`${REVIEWS_API_URL}/${reviewId}`);
};

// 🔹 Récupérer les statistiques d'un produit (note moyenne, nombre d'avis)
export const getProductReviewStats = async (productId) => {
  const res = await axios.get(`${REVIEWS_API_URL}/product/${productId}/stats`);
  return res.data;
};

// 🔹 Récupérer les avis récents (pour la page d'accueil)
export const getRecentReviews = async (limit = 10) => {
  const res = await axios.get(`${REVIEWS_API_URL}/recent?limit=${limit}`);
  return res.data;
};

// 🔹 Récupérer tous les avis (pour l'admin)
export const getAllReviews = async () => {
  const res = await axios.get(REVIEWS_API_URL);
  return res.data;
};

// 🔹 TESTIMONIAL API FUNCTIONS

const TESTIMONIALS_API_URL = "http://localhost:8081/api/testimonials";

// 🔹 Récupérer tous les témoignages approuvés
export const getApprovedTestimonials = async () => {
  const res = await axios.get(`${TESTIMONIALS_API_URL}/approved`);
  return res.data;
};

// 🔹 Récupérer tous les témoignages (admin)
export const getAllTestimonials = async () => {
  const res = await axios.get(TESTIMONIALS_API_URL);
  return res.data;
};

// 🔹 Récupérer les témoignages en attente (admin)
export const getPendingTestimonials = async () => {
  const res = await axios.get(`${TESTIMONIALS_API_URL}/pending`);
  return res.data;
};

// 🔹 Récupérer un témoignage par ID
export const getTestimonialById = async (testimonialId) => {
  const res = await axios.get(`${TESTIMONIALS_API_URL}/${testimonialId}`);
  return res.data;
};

// 🔹 Créer un nouveau témoignage
export const createTestimonial = async (testimonial) => {
  const res = await axios.post(TESTIMONIALS_API_URL, testimonial);
  return res.data;
};

// 🔹 Mettre à jour un témoignage (admin)
export const updateTestimonial = async (testimonialId, testimonial) => {
  const res = await axios.put(`${TESTIMONIALS_API_URL}/${testimonialId}`, testimonial);
  return res.data;
};

// 🔹 Approuver un témoignage (admin)
export const approveTestimonial = async (testimonialId) => {
  const res = await axios.put(`${TESTIMONIALS_API_URL}/${testimonialId}/approve`);
  return res.data;
};

// 🔹 Supprimer un témoignage
export const deleteTestimonial = async (testimonialId) => {
  await axios.delete(`${TESTIMONIALS_API_URL}/${testimonialId}`);
};

// 🔹 Récupérer les statistiques des témoignages
export const getTestimonialStats = async () => {
  const res = await axios.get(`${TESTIMONIALS_API_URL}/stats`);
  return res.data;
};
