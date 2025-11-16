package com.example.ecommerce_api.service;

import com.example.ecommerce_api.dao.PaiementRepository;
import com.example.ecommerce_api.entity.Commande;
import com.example.ecommerce_api.entity.Paiement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PaiementService {

    @Autowired
    private PaiementRepository paiementRepository;

    @Autowired
    private CommandeService commandeService;

    /**
     * Effectuer un paiement (simulation).
     * - vérifie s'il existe déjà un paiement pour la commande
     * - attache la commande gérée avant save (commandeService.getCommandeById)
     * - met à jour le statut de commande si SUCCES
     */
    public Paiement effectuerPaiement(Paiement paiement) {
        if (paiement.getCommande() == null || paiement.getCommande().getId() == null) {
            throw new RuntimeException("Commande requise pour paiement");
        }

        // Récupère la commande gérée depuis la BDD (pour éviter tentative re-insert)
        Commande commande = commandeService.getCommandeById(paiement.getCommande().getId());

        // Vérifie paiement existant
        Optional<Paiement> existing = paiementRepository.findByCommande(commande);
        if (existing.isPresent()) {
            throw new RuntimeException("Paiement déjà effectué pour cette commande");
        }

        // Simulation du traitement (ici tu peux appeler Stripe, etc.)
        paiement.setCommande(commande);
        paiement.setDatePaiement(LocalDateTime.now());
        paiement.setStatut("SUCCES"); // ou ECHEC si l'API externe renvoie un échec

        // Persiste le paiement
        Paiement saved = paiementRepository.save(paiement);

        // Met à jour le statut de la commande seulement si SUCCES
        if ("SUCCES".equalsIgnoreCase(saved.getStatut())) {
            commande.setStatut("PAYEE");
            commandeService.save(commande);
        }

        return saved;
    }

    public Paiement getPaiementById(Long id) {
        return paiementRepository.findById(id).orElseThrow(() -> new RuntimeException("Paiement introuvable id=" + id));
    }
}
