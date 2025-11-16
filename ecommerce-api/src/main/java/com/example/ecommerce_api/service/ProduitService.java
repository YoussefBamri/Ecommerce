package com.example.ecommerce_api.service;

import com.example.ecommerce_api.dao.ProduitRepository;
import com.example.ecommerce_api.entity.produit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProduitService {

    @Autowired
    private ProduitRepository produitRepository;

    // ➕ Ajouter un produit
    public produit ajouterProduit(produit produit) {
        return produitRepository.save(produit);
    }

    // ✏️ Modifier un produit
    public produit modifierProduit(Long id, produit produit) {
        produit existing = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        existing.setNom(produit.getNom());
        existing.setCategorie(produit.getCategorie());
        existing.setPrix(produit.getPrix());
        existing.setStock(produit.getStock());
        existing.setImageUrl(produit.getImageUrl());
        existing.setDescription(produit.getDescription());
        existing.setReduction(produit.getReduction());
        existing.setPrixSolde(produit.getPrixSolde());
        return produitRepository.save(existing);
    }

    // 🔽 Appliquer une réduction
    public produit appliquerReduction(Long id, double pourcentage) {
        produit p = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        if (pourcentage <= 0 || pourcentage >= 100)
            throw new RuntimeException("Pourcentage invalide");

        double prixSolde = p.getPrix() - (p.getPrix() * pourcentage / 100);
        p.setReduction(pourcentage);
        p.setPrixSolde(prixSolde);
        return produitRepository.save(p);
    }

    // ❌ Supprimer la réduction
    public produit supprimerReduction(Long id) {
        produit p = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        p.setPrixSolde(null);
        p.setReduction(null);
        return produitRepository.save(p);
    }

    // 🔍 Obtenir un produit par ID
    public produit getProduitById(Long id) {
        return produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
    }

    // 📋 Obtenir tous les produits
    public List<produit> getAllProduits() {
        return produitRepository.findAll();
    }

    // 🗑️ Supprimer un produit
    public void supprimerProduit(Long id) {
        if (!produitRepository.existsById(id))
            throw new RuntimeException("Produit non trouvé");
        produitRepository.deleteById(id);
    }

    // 🔻 Décrémenter le stock d’un produit après une commande
    public void decrementerStock(Long produitId, int quantite) {
        produit p = produitRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable avec l'id : " + produitId));

        if (quantite <= 0)
            throw new IllegalArgumentException("La quantité doit être supérieure à zéro.");

        if (p.getStock() < quantite)
            throw new RuntimeException("Stock insuffisant pour le produit : " + p.getNom());

        p.setStock(p.getStock() - quantite);
        produitRepository.save(p);
    }

    // 🔼 Incrémenter le stock (utile si commande annulée)
    public void incrementerStock(Long produitId, int quantite) {
        produit p = produitRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable avec l'id : " + produitId));

        if (quantite <= 0)
            throw new IllegalArgumentException("La quantité doit être supérieure à zéro.");

        p.setStock(p.getStock() + quantite);
        produitRepository.save(p);
    }
}
