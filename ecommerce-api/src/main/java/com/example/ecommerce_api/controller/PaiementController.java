package com.example.ecommerce_api.controller;

import com.example.ecommerce_api.entity.Commande;
import com.example.ecommerce_api.entity.Paiement;
import com.example.ecommerce_api.service.CommandeService;
import com.example.ecommerce_api.service.PaiementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/paiements")
@CrossOrigin(origins = "http://localhost:3000")
public class PaiementController {

    @Autowired
    private PaiementService paiementService;

    @Autowired
    private CommandeService commandeService;

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
    public Paiement effectuerPaiement(@RequestBody Map<String, Object> req) {
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
        // Si tu utilises une vraie passerelle : appelle l'API (Stripe, PayPal), récupère le résultat,
        // puis mets paiement.statut = "SUCCES" ou "ECHEC" et sauvegarde.

        return paiementService.effectuerPaiement(paiement);
    }
}
