package com.example.ecommerce_api.controller;

import com.example.ecommerce_api.entity.Client;
import com.example.ecommerce_api.entity.Commande;
import com.example.ecommerce_api.entity.LigneCommande;
import com.example.ecommerce_api.service.ClientService;
import com.example.ecommerce_api.service.CommandeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/commandes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class CommandeController {

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
    public List<Commande> getAll() {
        return commandeService.getAllCommandes();
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
}
