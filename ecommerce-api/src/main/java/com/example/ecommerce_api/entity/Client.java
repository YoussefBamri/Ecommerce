package com.example.ecommerce_api.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String email;
    private String telephone;

    // Adresse imbriquée (une seule adresse pour un client)
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "adresse_id")
    @JsonManagedReference
    private AdresseLivraison adresseLivraison;

    public Client() {}

    // getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public AdresseLivraison getAdresseLivraison() { return adresseLivraison; }
    public void setAdresseLivraison(AdresseLivraison adresseLivraison) { this.adresseLivraison = adresseLivraison; }
}
