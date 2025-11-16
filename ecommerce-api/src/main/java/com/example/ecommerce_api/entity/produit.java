package com.example.ecommerce_api.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "produits")
public class produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String categorie;

    @Column(nullable = false)
    private Double prix;

    @Column(nullable = false)
    private Integer stock;

    private String imageUrl;

    @Column(length = 1000)
    private String description;

    // Champs pour les soldes
    private Double prixSolde;    // prix après réduction
    private Double reduction;    // pourcentage de réduction

    public produit() {}

    public produit(String nom, String categorie, Double prix, Integer stock, String imageUrl, String description) {
        this.nom = nom;
        this.categorie = categorie;
        this.prix = prix;
        this.stock = stock;
        this.imageUrl = imageUrl;
        this.description = description;
    }

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }

    public Double getPrix() { return prix; }
    public void setPrix(Double prix) { this.prix = prix; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrixSolde() { return prixSolde; }
    public void setPrixSolde(Double prixSolde) { this.prixSolde = prixSolde; }

    public Double getReduction() { return reduction; }
    public void setReduction(Double reduction) { this.reduction = reduction; }
}
