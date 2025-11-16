package com.example.ecommerce_api.dao;

import com.example.ecommerce_api.entity.Commande;
import com.example.ecommerce_api.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommandeRepository extends JpaRepository<Commande, Long> {
    List<Commande> findByClient(Client client);
}
