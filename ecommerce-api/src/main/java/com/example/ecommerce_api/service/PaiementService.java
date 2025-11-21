package com.example.ecommerce_api.service;

import com.example.ecommerce_api.dao.PaiementRepository;
import com.example.ecommerce_api.entity.Commande;
import com.example.ecommerce_api.entity.Paiement;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PaiementService {

    @Autowired
    private PaiementRepository paiementRepository;

    @Autowired
    private CommandeService commandeService;

    @Value("${stripe.api.secret-key}")
    private String stripeSecretKey;

    @PostConstruct
    public void initStripe() {
        // Initialize Stripe API key
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Effectuer un paiement via Stripe.
     * - vérifie s'il existe déjà un paiement pour la commande
     * - attache la commande gérée avant save (commandeService.getCommandeById)
     * - crée un PaymentIntent Stripe et confirme le paiement
     * - met à jour le statut de commande si SUCCES
     */
    public Paiement effectuerPaiement(Paiement paiement) throws StripeException {
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

        try {
            // Créer un PaymentIntent avec Stripe
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount((long) (paiement.getMontant() * 100)) // Montant en cents
                .setCurrency("usd") // ou "eur" selon votre devise
                .setDescription("Paiement commande #" + commande.getId())
                .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            // Confirmer le paiement (dans un vrai scénario, ceci serait fait côté client)
            // Pour les tests, on simule une confirmation réussie
            PaymentIntent confirmedPaymentIntent = paymentIntent.confirm();

            // Mettre à jour le paiement avec les infos Stripe
            paiement.setCommande(commande);
            paiement.setDatePaiement(LocalDateTime.now());
            paiement.setStatut("SUCCES"); // PaymentIntent confirmé avec succès
            paiement.setReferencePaiement(paymentIntent.getId()); // Stocker l'ID Stripe

        } catch (StripeException e) {
            // En cas d'erreur Stripe, marquer comme échoué
            paiement.setCommande(commande);
            paiement.setDatePaiement(LocalDateTime.now());
            paiement.setStatut("ECHEC");
            paiement.setReferencePaiement("ERROR: " + e.getMessage());

            // Persiste le paiement échoué
            Paiement saved = paiementRepository.save(paiement);
            throw new RuntimeException("Erreur de paiement Stripe: " + e.getMessage());
        }

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
