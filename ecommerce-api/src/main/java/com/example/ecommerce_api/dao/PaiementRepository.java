package com.example.ecommerce_api.dao;

import com.example.ecommerce_api.entity.Paiement;
import com.example.ecommerce_api.entity.Commande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PaiementRepository extends JpaRepository<Paiement, Long> {
    Optional<Paiement> findByCommande(Commande commande);
}
