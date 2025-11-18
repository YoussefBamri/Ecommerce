package com.example.ecommerce_api.dao;

import com.example.ecommerce_api.entity.HistoriqueStatut;
import com.example.ecommerce_api.entity.Commande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HistoriqueStatutRepository extends JpaRepository<HistoriqueStatut, Long> {
    List<HistoriqueStatut> findByCommande(Commande commande);
    List<HistoriqueStatut> findByCommandeOrderByDateChangementDesc(Commande commande);
}