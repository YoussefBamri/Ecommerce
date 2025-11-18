package com.example.ecommerce_api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "commandes")
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dateCommande;
    private Double total;
    private String statut; // EN_ATTENTE, PAYEE, LIVREE, ...

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<LigneCommande> lignesCommande = new ArrayList<>();

    @OneToOne(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Paiement paiement;

    // New tracking fields
    private String numeroSuivi;           // Tracking number
    private LocalDateTime dateExpedition; // Shipping date
    private LocalDateTime dateLivraisonEstimee; // Estimated delivery date
    private LocalDateTime dateLivraisonReelle;  // Actual delivery date
    private String transporteur;          // Shipping carrier (e.g., "DHL", "UPS")
    private String notesLivraison;        // Delivery notes

    // Order-specific delivery address
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "adresse_livraison_id")
    private AdresseLivraison adresseLivraison;

    // Status change history
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HistoriqueStatut> historiqueStatuts = new ArrayList<>();

    public Commande() {}

    // getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getDateCommande() { return dateCommande; }
    public void setDateCommande(LocalDateTime dateCommande) { this.dateCommande = dateCommande; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }

    public List<LigneCommande> getLignesCommande() { return lignesCommande; }
    public void setLignesCommande(List<LigneCommande> lignesCommande) {
        this.lignesCommande.clear();
        if (lignesCommande != null) {
            this.lignesCommande.addAll(lignesCommande);
        }
    }

    public Paiement getPaiement() { return paiement; }
    public void setPaiement(Paiement paiement) { this.paiement = paiement; }

    // New getters and setters for tracking fields
    public String getNumeroSuivi() { return numeroSuivi; }
    public void setNumeroSuivi(String numeroSuivi) { this.numeroSuivi = numeroSuivi; }

    public LocalDateTime getDateExpedition() { return dateExpedition; }
    public void setDateExpedition(LocalDateTime dateExpedition) { this.dateExpedition = dateExpedition; }

    public LocalDateTime getDateLivraisonEstimee() { return dateLivraisonEstimee; }
    public void setDateLivraisonEstimee(LocalDateTime dateLivraisonEstimee) { this.dateLivraisonEstimee = dateLivraisonEstimee; }

    public LocalDateTime getDateLivraisonReelle() { return dateLivraisonReelle; }
    public void setDateLivraisonReelle(LocalDateTime dateLivraisonReelle) { this.dateLivraisonReelle = dateLivraisonReelle; }

    public String getTransporteur() { return transporteur; }
    public void setTransporteur(String transporteur) { this.transporteur = transporteur; }

    public String getNotesLivraison() { return notesLivraison; }
    public void setNotesLivraison(String notesLivraison) { this.notesLivraison = notesLivraison; }

    public AdresseLivraison getAdresseLivraison() { return adresseLivraison; }
    public void setAdresseLivraison(AdresseLivraison adresseLivraison) { this.adresseLivraison = adresseLivraison; }

    public List<HistoriqueStatut> getHistoriqueStatuts() { return historiqueStatuts; }
    public void setHistoriqueStatuts(List<HistoriqueStatut> historiqueStatuts) {
        this.historiqueStatuts.clear();
        if (historiqueStatuts != null) {
            this.historiqueStatuts.addAll(historiqueStatuts);
        }
    }
}
