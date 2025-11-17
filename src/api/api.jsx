import axios from "axios";

const API_URL = "http://localhost:8081/api/produits"; // URL du backend Spring Boot

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
