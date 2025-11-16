package com.example.ecommerce_api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "paiements", uniqueConstraints = @UniqueConstraint(columnNames = "commande_id"))
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTransaction;

    private String statut;         // SUCCES ou ECHEC
    private Double montant;
    private String modePaiement;   // ex: "CARTE_BANCAIRE"
    private LocalDateTime datePaiement;

    @OneToOne
    @JoinColumn(name = "commande_id", unique = true)
    @JsonIgnore // éviter boucle JSON; on renvoie commande si nécessaire via autre endpoint
    private Commande commande;

    public Paiement() {}

    // getters / setters
    public Long getIdTransaction() { return idTransaction; }
    public void setIdTransaction(Long idTransaction) { this.idTransaction = idTransaction; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public Double getMontant() { return montant; }
    public void setMontant(Double montant) { this.montant = montant; }

    public String getModePaiement() { return modePaiement; }
    public void setModePaiement(String modePaiement) { this.modePaiement = modePaiement; }

    public LocalDateTime getDatePaiement() { return datePaiement; }
    public void setDatePaiement(LocalDateTime datePaiement) { this.datePaiement = datePaiement; }

    public Commande getCommande() { return commande; }
    public void setCommande(Commande commande) { this.commande = commande; }
}
