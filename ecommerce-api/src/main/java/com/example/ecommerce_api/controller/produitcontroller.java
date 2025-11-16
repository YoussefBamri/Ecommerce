package com.example.ecommerce_api.controller;

import com.example.ecommerce_api.entity.produit;
import com.example.ecommerce_api.service.ProduitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
@RestController
@RequestMapping("/api/produits")
public class produitcontroller {

    @Autowired
    private ProduitService produitService;

    // 📦 Ajouter un produit sans image
    @PostMapping
    public produit ajouterProduit(@RequestBody produit produit) {
        return produitService.ajouterProduit(produit);
    }

    // 📸 Ajouter un produit avec image
    @PostMapping("/upload")
    public produit ajouterProduitAvecImage(
            @RequestParam("nom") String nom,
            @RequestParam("categorie") String categorie,
            @RequestParam("prix") double prix,
            @RequestParam("stock") int stock,
            @RequestParam("description") String description,
            @RequestParam(value = "reduction", required = false) Double reduction,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        produit p = new produit();
        p.setNom(nom);
        p.setCategorie(categorie);
        p.setPrix(prix);
        p.setStock(stock);
        p.setDescription(description);
        p.setReduction(reduction);

        if (image != null && !image.isEmpty()) {
            try {
                // Dossier d’upload
                String uploadDir = "uploads/";
                Files.createDirectories(Paths.get(uploadDir));

                // Nom unique du fichier
                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                Path filePath = Paths.get(uploadDir + fileName);
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // Enregistrer le chemin
                p.setImageUrl("/uploads/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Erreur lors de l’enregistrement de l’image : " + e.getMessage());
            }
        }

        return produitService.ajouterProduit(p);
    }

    // ✏️ Modifier un produit (sans image)
    @PutMapping("/{id}")
    public produit modifierProduit(@PathVariable Long id, @RequestBody produit produit) {
        return produitService.modifierProduit(id, produit);
    }

    // ✏️ Modifier un produit AVEC image
    @PutMapping("/{id}/upload")
    public produit modifierProduitAvecImage(
            @PathVariable Long id,
            @RequestParam("nom") String nom,
            @RequestParam("categorie") String categorie,
            @RequestParam("prix") double prix,
            @RequestParam("stock") int stock,
            @RequestParam("description") String description,
            @RequestParam(value = "reduction", required = false) Double reduction,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        produit existing = produitService.getProduitById(id);
        existing.setNom(nom);
        existing.setCategorie(categorie);
        existing.setPrix(prix);
        existing.setStock(stock);
        existing.setDescription(description);
        existing.setReduction(reduction);

        if (image != null && !image.isEmpty()) {
            try {
                String uploadDir = "uploads/";
                Files.createDirectories(Paths.get(uploadDir));
                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                Path filePath = Paths.get(uploadDir + fileName);
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                existing.setImageUrl("/uploads/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Erreur lors de l’enregistrement de l’image : " + e.getMessage());
            }
        }

        return produitService.modifierProduit(id, existing);
    }

    // 🔍 Obtenir tous les produits
    @GetMapping
    public List<produit> getAllProduits() {
        return produitService.getAllProduits();
    }

    // 🔍 Obtenir un produit par ID
    @GetMapping("/{id}")
    public produit getProduitById(@PathVariable Long id) {
        return produitService.getProduitById(id);
    }

    // ❌ Supprimer un produit
    @DeleteMapping("/{id}")
    public void supprimerProduit(@PathVariable Long id) {
        produitService.supprimerProduit(id);
    }

    // 🔽 Appliquer une réduction (solde)
    @PutMapping("/{id}/solde/{pourcentage}")
    public produit appliquerSolde(@PathVariable Long id, @PathVariable double pourcentage) {
        return produitService.appliquerReduction(id, pourcentage);
    }

    // ❌ Supprimer la réduction
    @PutMapping("/{id}/solde/remove")
    public produit supprimerSolde(@PathVariable Long id) {
        return produitService.supprimerReduction(id);
    }
}

// ⚙️ Configuration pour afficher les images uploadées
@Configuration
class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
