package com.example.ecommerce_api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "commandes")
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dateCommande;
    private Double total;
    private String statut; // EN_ATTENTE, PAYEE, LIVREE, ...

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    @JsonIgnore
    private Client client;

    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<LigneCommande> lignesCommande = new ArrayList<>();

    @OneToOne(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private Paiement paiement;

    // New tracking fields
    @Column(nullable = true)
    private String numeroSuivi;           // Tracking number

    @Column(nullable = true)
    private LocalDateTime dateExpedition; // Shipping date

    @Column(nullable = true)
    private LocalDateTime dateLivraisonEstimee; // Estimated delivery date

    @Column(nullable = true)
    private LocalDateTime dateLivraisonReelle;  // Actual delivery date

    @Column(nullable = true)
    private String transporteur;          // Shipping carrier (e.g., "DHL", "UPS")

    @Column(nullable = true)
    private String notesLivraison;        // Delivery notes

    // Order-specific delivery address (embedded to avoid relationship conflicts)
    @Column(nullable = true)
    private String rueLivraison;
    @Column(nullable = true)
    private String villeLivraison;
    @Column(nullable = true)
    private String codePostalLivraison;
    @Column(nullable = true)
    private String paysLivraison;

    // Status change history
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
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

    public String getRueLivraison() { return rueLivraison; }
    public void setRueLivraison(String rueLivraison) { this.rueLivraison = rueLivraison; }

    public String getVilleLivraison() { return villeLivraison; }
    public void setVilleLivraison(String villeLivraison) { this.villeLivraison = villeLivraison; }

    public String getCodePostalLivraison() { return codePostalLivraison; }
    public void setCodePostalLivraison(String codePostalLivraison) { this.codePostalLivraison = codePostalLivraison; }

    public String getPaysLivraison() { return paysLivraison; }
    public void setPaysLivraison(String paysLivraison) { this.paysLivraison = paysLivraison; }

    public List<HistoriqueStatut> getHistoriqueStatuts() { return historiqueStatuts; }
    public void setHistoriqueStatuts(List<HistoriqueStatut> historiqueStatuts) {
        this.historiqueStatuts.clear();
        if (historiqueStatuts != null) {
            this.historiqueStatuts.addAll(historiqueStatuts);
        }
    }
}
