package com.example.ecommerce_api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historique_statut")
public class HistoriqueStatut {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "commande_id", nullable = false)
    private Commande commande;

    @Column(nullable = true)
    private String ancienStatut;

    @Column(nullable = false)
    private String nouveauStatut;

    @Column(nullable = false)
    private LocalDateTime dateChangement;

    @Column(nullable = true)
    private String commentaire; // Optional note about the change

    @Column(nullable = true)
    private String utilisateur; // Who made the change (admin/customer)

    public HistoriqueStatut() {}

    public HistoriqueStatut(Commande commande, String ancienStatut, String nouveauStatut, String commentaire, String utilisateur) {
        this.commande = commande;
        this.ancienStatut = ancienStatut;
        this.nouveauStatut = nouveauStatut;
        this.dateChangement = LocalDateTime.now();
        this.commentaire = commentaire;
        this.utilisateur = utilisateur;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Commande getCommande() { return commande; }
    public void setCommande(Commande commande) { this.commande = commande; }

    public String getAncienStatut() { return ancienStatut; }
    public void setAncienStatut(String ancienStatut) { this.ancienStatut = ancienStatut; }

    public String getNouveauStatut() { return nouveauStatut; }
    public void setNouveauStatut(String nouveauStatut) { this.nouveauStatut = nouveauStatut; }

    public LocalDateTime getDateChangement() { return dateChangement; }
    public void setDateChangement(LocalDateTime dateChangement) { this.dateChangement = dateChangement; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public String getUtilisateur() { return utilisateur; }
    public void setUtilisateur(String utilisateur) { this.utilisateur = utilisateur; }
}