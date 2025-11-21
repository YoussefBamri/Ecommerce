package com.example.ecommerce_api.controller;

import com.example.ecommerce_api.entity.Commande;
import com.example.ecommerce_api.entity.LigneCommande;
import com.example.ecommerce_api.entity.Paiement;
import com.example.ecommerce_api.dao.PaiementRepository;
import com.example.ecommerce_api.service.CommandeService;
import com.example.ecommerce_api.service.PaiementService;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.checkout.SessionRetrieveParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/paiements")
@CrossOrigin(origins = {"http://localhost:3000"})
public class PaiementController {

    @Autowired
    private PaiementService paiementService;

    @Autowired
    private CommandeService commandeService;

    @Autowired
    private PaiementRepository paiementRepository;

    /**
     * Exemple payload:
     * {
     *   "montant": 119.98,
     *   "commandeId": 5,
     *   "modePaiement": "CARTE_BANCAIRE",
     *   "numeroCarte": "4111111111111111",  // facultatif, on ne stocke pas
     *   "nomCarte": "Ali Ben",
     *   "dateExpiration": "12/25",
     *   "cvv": "123"
     * }
     */
    @PostMapping
    public ResponseEntity<?> effectuerPaiement(@RequestBody Map<String, Object> req) {
        try {
            Double montant = Double.valueOf(req.get("montant").toString());
            Long commandeId = Long.valueOf(req.get("commandeId").toString());
            String mode = req.getOrDefault("modePaiement", "CARTE_BANCAIRE").toString();

            // Récupère la commande gérée
            Commande commande = commandeService.getCommandeById(commandeId);

            Paiement paiement = new Paiement();
            paiement.setMontant(montant);
            paiement.setModePaiement(mode);
            paiement.setCommande(commande);

            // IMPORTANT : on ne stocke pas les données de carte (numero, cvv, etc.)
            // Stripe gère la tokenisation côté client et on confirme côté serveur

            Paiement result = paiementService.effectuerPaiement(paiement);
            return ResponseEntity.ok(result);

        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Erreur de paiement Stripe: " + e.getMessage()));
        } catch (RuntimeException e) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                 .body(Map.of("error", e.getMessage()));
         }
     }

     /**
      * Créer une session Stripe Checkout pour paiement hébergé
      */
     @PostMapping("/create-checkout-session")
     public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, Object> request) {
         try {
             Long commandeId = Long.valueOf(request.get("commandeId").toString());
             Double amount = Double.valueOf(request.get("amount").toString());
             String currency = (String) request.getOrDefault("currency", "usd");
             String successUrl = (String) request.get("successUrl");
             String cancelUrl = (String) request.get("cancelUrl");

             // Récupérer la commande pour les détails
             Commande commande = commandeService.getCommandeById(commandeId);

             // Créer les paramètres de la session Stripe Checkout
             SessionCreateParams.Builder builder = SessionCreateParams.builder()
                 .setMode(SessionCreateParams.Mode.PAYMENT)
                 .setSuccessUrl(successUrl)
                 .setCancelUrl(cancelUrl)
                 .setClientReferenceId(commandeId.toString())
                 .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD);

             // Ajouter les items de ligne de commande
             for (LigneCommande ligne : commande.getLignesCommande()) {
                 builder.addLineItem(
                     SessionCreateParams.LineItem.builder()
                         .setPriceData(
                             SessionCreateParams.LineItem.PriceData.builder()
                                 .setCurrency(currency.toLowerCase())
                                 .setUnitAmount((long) (ligne.getPrixUnitaire() * 100)) // Montant en cents
                                 .setProductData(
                                     SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                         .setName(ligne.getProduit().getNom())
                                         .setDescription("Quantité: " + ligne.getQuantite())
                                         .build()
                                 )
                                 .build()
                         )
                         .setQuantity((long) ligne.getQuantite())
                         .build()
                 );
             }

             // Créer la session
             Session session = Session.create(builder.build());

             // Retourner l'URL de la session Stripe Checkout
             Map<String, String> response = new HashMap<>();
             response.put("url", session.getUrl());
             response.put("sessionId", session.getId());

             return ResponseEntity.ok(response);

         } catch (StripeException e) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                 .body(Map.of("error", "Erreur Stripe: " + e.getMessage()));
         } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                 .body(Map.of("error", "Erreur lors de la création de la session: " + e.getMessage()));
         }
     }

     /**
      * Gérer le succès d'un paiement Stripe Checkout
      */
     @GetMapping("/checkout-success")
     public ResponseEntity<?> handleCheckoutSuccess(@RequestParam String session_id) {
         try {
             System.out.println("PaiementController: Handling checkout success for session: " + session_id);
             // Récupérer la session Stripe
             Session session = Session.retrieve(session_id);
             System.out.println("PaiementController: Retrieved session, payment status: " + session.getPaymentStatus());

             if ("paid".equals(session.getPaymentStatus())) {
                 // Le paiement a réussi
                 String commandeId = session.getClientReferenceId();
                 Long orderId = Long.valueOf(commandeId);

                 // Récupérer la commande
                 Commande commande = commandeService.getCommandeById(orderId);

                 // Créer l'enregistrement de paiement
                 Paiement paiement = new Paiement();
                 paiement.setMontant((double) session.getAmountTotal() / 100); // Convertir de cents
                 paiement.setModePaiement("CARTE_BANCAIRE");
                 paiement.setCommande(commande);
                 paiement.setDatePaiement(java.time.LocalDateTime.now());
                 paiement.setStatut("SUCCES");
                 paiement.setReferencePaiement(session.getId());

                 // Sauvegarder le paiement
                 Paiement savedPaiement = paiementRepository.save(paiement);
                 System.out.println("PaiementController: Payment saved with ID: " + savedPaiement.getIdTransaction());

                 // Mettre à jour le statut de la commande
                 commande.setStatut("PAYEE");
                 commandeService.save(commande);
                 System.out.println("PaiementController: Order status updated to PAYEE for order ID: " + orderId);

                 // Retourner les informations de succès
                 Map<String, Object> response = new HashMap<>();
                 response.put("success", true);
                 response.put("orderId", orderId);
                 response.put("sessionId", session_id);
                 response.put("amount", session.getAmountTotal() / 100.0);

                 return ResponseEntity.ok(response);
             } else {
                 return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                     .body(Map.of("error", "Paiement non confirmé"));
             }

         } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                 .body(Map.of("error", "Erreur lors du traitement du paiement: " + e.getMessage()));
         }
     }
 }
