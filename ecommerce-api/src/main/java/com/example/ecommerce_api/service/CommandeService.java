package com.example.ecommerce_api.service;

import com.example.ecommerce_api.dao.CommandeRepository;
import com.example.ecommerce_api.dao.HistoriqueStatutRepository;
import com.example.ecommerce_api.dao.ProduitRepository;
import com.example.ecommerce_api.entity.Client;
import com.example.ecommerce_api.entity.Commande;
import com.example.ecommerce_api.entity.HistoriqueStatut;
import com.example.ecommerce_api.entity.LigneCommande;
import com.example.ecommerce_api.entity.produit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommandeService {

    @Autowired
    private CommandeRepository commandeRepository;

    @Autowired
    private ProduitRepository produitRepository;

    @Autowired
    private HistoriqueStatutRepository historiqueStatutRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Crée une commande : lie les lignes et persiste en cascade
     */
    @Transactional
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

    @Transactional(readOnly = true)
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

    /**
     * Met à jour le statut d'une commande et enregistre l'historique
     */
    @Transactional
    public Commande mettreAJourStatut(Long commandeId, String nouveauStatut, String commentaire, String utilisateur) {
        Commande commande = getCommandeById(commandeId);
        String ancienStatut = commande.getStatut();

        // Créer l'entrée d'historique
        HistoriqueStatut historique = new HistoriqueStatut(commande, ancienStatut, nouveauStatut, commentaire, utilisateur);
        historiqueStatutRepository.save(historique);

        // Mettre à jour le statut
        commande.setStatut(nouveauStatut);
        Commande commandeSauvegardee = commandeRepository.save(commande);

        // Envoyer une notification par email pour les changements de statut importants
        envoyerNotificationStatutSiNecessaire(commandeSauvegardee, ancienStatut, nouveauStatut);

        return commandeSauvegardee;
    }

    /**
     * Détermine si une notification email doit être envoyée pour ce changement de statut
     */
    private void envoyerNotificationStatutSiNecessaire(Commande commande, String ancienStatut, String nouveauStatut) {
        // Liste des statuts qui déclenchent une notification
        String[] statutsNotifiables = {"CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"};

        // Vérifier si le nouveau statut nécessite une notification
        for (String statut : statutsNotifiables) {
            if (statut.equals(nouveauStatut)) {
                emailService.envoyerNotificationStatut(commande, ancienStatut, nouveauStatut);
                break;
            }
        }
    }

    /**
     * Marque une commande comme expédiée avec numéro de suivi
     */
    @Transactional
    public Commande expedierCommande(Long commandeId, String numeroSuivi, String transporteur, LocalDateTime dateExpedition, String utilisateur) {
        Commande commande = getCommandeById(commandeId);

        commande.setNumeroSuivi(numeroSuivi);
        commande.setTransporteur(transporteur);
        commande.setDateExpedition(dateExpedition);

        // Calculer la date de livraison estimée (exemple: +3 jours)
        LocalDateTime dateEstimee = dateExpedition.plusDays(3);
        commande.setDateLivraisonEstimee(dateEstimee);

        // Mettre à jour le statut
        return mettreAJourStatut(commandeId, "SHIPPED", "Commande expédiée avec numéro de suivi: " + numeroSuivi, utilisateur);
    }

    /**
     * Marque une commande comme livrée
     */
    @Transactional
    public Commande marquerLivree(Long commandeId, LocalDateTime dateLivraison, String utilisateur) {
        Commande commande = getCommandeById(commandeId);

        commande.setDateLivraisonReelle(dateLivraison);

        return mettreAJourStatut(commandeId, "DELIVERED", "Commande livrée le " + dateLivraison.toLocalDate(), utilisateur);
    }

    /**
     * Annule une commande
     */
    @Transactional
    public Commande annulerCommande(Long commandeId, String raison, String utilisateur) {
        return mettreAJourStatut(commandeId, "CANCELLED", raison, utilisateur);
    }

    /**
     * Récupère l'historique des statuts d'une commande
     */
    @Transactional(readOnly = true)
    public List<HistoriqueStatut> getHistoriqueStatut(Long commandeId) {
        Commande commande = getCommandeById(commandeId);
        return historiqueStatutRepository.findByCommandeOrderByDateChangementDesc(commande);
    }
}
