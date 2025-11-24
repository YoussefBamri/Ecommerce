package com.example.ecommerce_api.dao;

import com.example.ecommerce_api.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {

    // Trouver les chauffeurs disponibles
    List<Driver> findByDisponibleTrue();

    // Trouver un chauffeur par téléphone
    Driver findByTelephone(String telephone);

    // Trouver un chauffeur par email
    Driver findByEmail(String email);
}