package com.example.ecommerce_api.service;

import com.example.ecommerce_api.dao.CommandeRepository;
import com.example.ecommerce_api.dao.ProduitRepository;
import com.example.ecommerce_api.entity.Client;
import com.example.ecommerce_api.entity.Commande;
import com.example.ecommerce_api.entity.LigneCommande;
import com.example.ecommerce_api.entity.produit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommandeService {

    @Autowired
    private CommandeRepository commandeRepository;

    @Autowired
    private ProduitRepository produitRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Crée une commande : lie les lignes et persiste en cascade
     */
    public Commande creerCommande(Commande commande, Long clientId) {
        // la commande doit contenir client (ou le controller attachera le client)
        commande.setDateCommande(LocalDateTime.now());
        commande.setStatut("EN_ATTENTE");

        // lier les lignes -> set commande sur chaque ligne et vérifier produit
        if (commande.getLignesCommande() != null) {
            for (LigneCommande ligne : commande.getLignesCommande()) {
                if (ligne.getProduit() != null && ligne.getProduit().getId() != null) {
                    produit p = produitRepository.findById(ligne.getProduit().getId())
                            .orElseThrow(() -> new RuntimeException("Produit non trouvé id=" + ligne.getProduit().getId()));
                    ligne.setProduit(p);
                } else {
                    throw new RuntimeException("Produit absent dans ligne de commande");
                }
                ligne.setCommande(commande);
            }
        }

        return commandeRepository.save(commande);
    }

    public Commande getCommandeById(Long id) {
        return commandeRepository.findById(id).orElseThrow(() -> new RuntimeException("Commande non trouvée id=" + id));
    }

    public Commande save(Commande commande) {
        return commandeRepository.save(commande);
    }

    public List<Commande> getAllCommandes() {
        return commandeRepository.findAll();
    }

    /**
     * Envoie un email de confirmation de commande au client
     * L'email contient les détails de la commande formatés en HTML (comme un PDF)
     */
    public void envoyerEmailConfirmation(Commande commande) {
        try {
            emailService.envoyerEmailConfirmation(commande);
            System.out.println("✅ Email de confirmation envoyé avec succès à: " + commande.getClient().getEmail());
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'envoi de l'email: " + e.getMessage());
            e.printStackTrace();
            // Ne pas faire échouer la commande si l'email échoue
            // On log juste l'erreur
        }
    }
}
