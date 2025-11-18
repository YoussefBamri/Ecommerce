package com.example.ecommerce_api.controller;

import com.example.ecommerce_api.entity.Client;
import com.example.ecommerce_api.entity.Commande;
import com.example.ecommerce_api.entity.HistoriqueStatut;
import com.example.ecommerce_api.entity.LigneCommande;
import com.example.ecommerce_api.service.ClientService;
import com.example.ecommerce_api.service.CommandeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/commandes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class CommandeController {

    // DTO for order list (without lazy relationships)
    public static class OrderDTO {
        public Long id;
        public LocalDateTime dateCommande;
        public Double total;
        public String statut;
        public String numeroSuivi;
        public LocalDateTime dateExpedition;
        public LocalDateTime dateLivraisonEstimee;
        public LocalDateTime dateLivraisonReelle;
        public String transporteur;
        public String notesLivraison;
        public String rueLivraison;
        public String villeLivraison;
        public String codePostalLivraison;
        public String paysLivraison;
        public ClientInfo client;

        public OrderDTO(Commande commande) {
            this.id = commande.getId();
            this.dateCommande = commande.getDateCommande();
            this.total = commande.getTotal();
            this.statut = commande.getStatut();
            this.numeroSuivi = commande.getNumeroSuivi();
            this.dateExpedition = commande.getDateExpedition();
            this.dateLivraisonEstimee = commande.getDateLivraisonEstimee();
            this.dateLivraisonReelle = commande.getDateLivraisonReelle();
            this.transporteur = commande.getTransporteur();
            this.notesLivraison = commande.getNotesLivraison();
            this.rueLivraison = commande.getRueLivraison();
            this.villeLivraison = commande.getVilleLivraison();
            this.codePostalLivraison = commande.getCodePostalLivraison();
            this.paysLivraison = commande.getPaysLivraison();

            // Include basic client info
            if (commande.getClient() != null) {
                this.client = new ClientInfo(commande.getClient());
            }
        }
    }

    public static class ClientInfo {
        public Long id;
        public String nom;
        public String email;

        public ClientInfo(Client client) {
            this.id = client.getId();
            this.nom = client.getNom();
            this.email = client.getEmail();
        }
    }

    @Autowired
    private CommandeService commandeService;

    @Autowired
    private ClientService clientService;

    /**
     * Expects payload :
     * {
     *   "clientId": 1,
     *   "total": 119.98,
     *   "lignesCommande": [
     *     { "produit": { "id": 1 }, "quantite": 2, "prixUnitaire": 59.99 }
     *   ]
     * }
     */
    @PostMapping
    public Commande createCommande(@RequestBody Map<String, Object> payload) {
        Long clientId = Long.valueOf(payload.get("clientId").toString());
        Double total = Double.valueOf(payload.get("total").toString());

        // Construire la commande
        Commande commande = new Commande();
        commande.setTotal(total);

        // Attacher client
        Client client = clientService.getClientById(clientId);
        commande.setClient(client);

        // Construire les lignes depuis le JSON
        List<LigneCommande> lignes = new ArrayList<>();
        Object linesObj = payload.get("lignesCommande");
        if (linesObj instanceof List) {
            List<?> rawLines = (List<?>) linesObj;
            for (Object o : rawLines) {
                if (o instanceof Map) {
                    Map<?, ?> m = (Map<?, ?>) o;
                    LigneCommande lc = new LigneCommande();
                    lc.setQuantite(Integer.valueOf(m.get("quantite").toString()));
                    lc.setPrixUnitaire(Double.valueOf(m.get("prixUnitaire").toString()));
                    // produit minimal : { "id": 1 }
                    Object prodObj = m.get("produit");
                    if (prodObj instanceof Map) {
                        Map<?, ?> pm = (Map<?, ?>) prodObj;
                        com.example.ecommerce_api.entity.produit p = new com.example.ecommerce_api.entity.produit();
                        p.setId(Long.valueOf(pm.get("id").toString()));
                        lc.setProduit(p);
                    } else {
                        throw new RuntimeException("produit absent dans ligne");
                    }
                    lignes.add(lc);
                }
            }
        }

        commande.setLignesCommande(lignes);

        // Delegate à service qui lie tout et sauvegarde
        return commandeService.creerCommande(commande, clientId);
    }

    @GetMapping("/{id}")
    public Commande getCommande(@PathVariable Long id) {
        return commandeService.getCommandeById(id);
    }

    @GetMapping
    public List<OrderDTO> getAll() {
        List<Commande> commandes = commandeService.getAllCommandes();
        return commandes.stream()
                .map(OrderDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Envoie un email de confirmation de commande au client
     * L'email contient les détails de la commande (comme un PDF)
     */
    @PostMapping("/{id}/envoyer-email")
    public Map<String, String> envoyerEmailCommande(@PathVariable Long id) {
        Commande commande = commandeService.getCommandeById(id);

        // Appeler le service pour envoyer l'email
        commandeService.envoyerEmailConfirmation(commande);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Email de confirmation envoyé avec succès à " + commande.getClient().getEmail());
        response.put("status", "SUCCESS");
        return response;
    }

    /**
     * Récupère les informations de suivi d'une commande
     */
    @GetMapping("/{id}/tracking")
    public Map<String, Object> getTrackingInfo(@PathVariable Long id) {
        Commande commande = commandeService.getCommandeById(id);

        Map<String, Object> tracking = new HashMap<>();
        tracking.put("commandeId", commande.getId());
        tracking.put("statut", commande.getStatut());
        tracking.put("numeroSuivi", commande.getNumeroSuivi());
        tracking.put("transporteur", commande.getTransporteur());
        tracking.put("dateExpedition", commande.getDateExpedition());
        tracking.put("dateLivraisonEstimee", commande.getDateLivraisonEstimee());
        tracking.put("dateLivraisonReelle", commande.getDateLivraisonReelle());
        tracking.put("notesLivraison", commande.getNotesLivraison());

        return tracking;
    }

    /**
     * Met à jour le statut d'une commande (admin)
     */
    @PutMapping("/{id}/status")
    public Commande updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String nouveauStatut = (String) payload.get("statut");
        String commentaire = (String) payload.get("commentaire");
        String utilisateur = (String) payload.get("utilisateur");

        return commandeService.mettreAJourStatut(id, nouveauStatut, commentaire, utilisateur);
    }

    /**
     * Marque une commande comme expédiée
     */
    @PostMapping("/{id}/ship")
    public Commande shipOrder(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String numeroSuivi = (String) payload.get("numeroSuivi");
        String transporteur = (String) payload.get("transporteur");
        String utilisateur = (String) payload.get("utilisateur");

        // Date d'expédition par défaut : maintenant
        LocalDateTime dateExpedition = LocalDateTime.now();
        if (payload.containsKey("dateExpedition")) {
            // Si fournie, parser depuis String (ISO format)
            dateExpedition = LocalDateTime.parse((String) payload.get("dateExpedition"));
        }

        return commandeService.expedierCommande(id, numeroSuivi, transporteur, dateExpedition, utilisateur);
    }

    /**
     * Récupère l'historique des statuts d'une commande
     */
    @GetMapping("/{id}/history")
    public List<HistoriqueStatut> getStatusHistory(@PathVariable Long id) {
        return commandeService.getHistoriqueStatut(id);
    }

    /**
     * Marque une commande comme livrée
     */
    @PutMapping("/{id}/deliver")
    public Commande markAsDelivered(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String utilisateur = (String) payload.get("utilisateur");

        // Date de livraison par défaut : maintenant
        LocalDateTime dateLivraison = LocalDateTime.now();
        if (payload.containsKey("dateLivraison")) {
            dateLivraison = LocalDateTime.parse((String) payload.get("dateLivraison"));
        }

        return commandeService.marquerLivree(id, dateLivraison, utilisateur);
    }

    /**
     * Annule une commande
     */
    @PostMapping("/{id}/cancel")
    public Commande cancelOrder(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String raison = (String) payload.get("raison");
        String utilisateur = (String) payload.get("utilisateur");

        return commandeService.annulerCommande(id, raison, utilisateur);
    }
}
