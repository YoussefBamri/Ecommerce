package com.example.ecommerce_api.dao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.ecommerce_api.entity.produit;
@Repository
public interface ProduitRepository extends JpaRepository<produit, Long> {
}
