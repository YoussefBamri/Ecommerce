package com.example.ecommerce_api.service;

import com.example.ecommerce_api.dao.DriverRepository;
import com.example.ecommerce_api.entity.Driver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    // Créer un nouveau chauffeur
    public Driver createDriver(Driver driver) {
        // Vérifier si le téléphone ou l'email existe déjà
        if (driverRepository.findByTelephone(driver.getTelephone()) != null) {
            throw new RuntimeException("Un chauffeur avec ce numéro de téléphone existe déjà");
        }
        if (driverRepository.findByEmail(driver.getEmail()) != null) {
            throw new RuntimeException("Un chauffeur avec cet email existe déjà");
        }
        return driverRepository.save(driver);
    }

    // Récupérer tous les chauffeurs
    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    // Récupérer un chauffeur par ID
    public Driver getDriverById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chauffeur non trouvé avec l'ID: " + id));
    }

    // Récupérer les chauffeurs disponibles
    public List<Driver> getAvailableDrivers() {
        return driverRepository.findByDisponibleTrue();
    }

    // Mettre à jour un chauffeur
    public Driver updateDriver(Long id, Driver driverDetails) {
        Driver driver = getDriverById(id);

        // Vérifier les contraintes d'unicité si téléphone ou email changent
        if (!driver.getTelephone().equals(driverDetails.getTelephone()) &&
            driverRepository.findByTelephone(driverDetails.getTelephone()) != null) {
            throw new RuntimeException("Un chauffeur avec ce numéro de téléphone existe déjà");
        }
        if (!driver.getEmail().equals(driverDetails.getEmail()) &&
            driverRepository.findByEmail(driverDetails.getEmail()) != null) {
            throw new RuntimeException("Un chauffeur avec cet email existe déjà");
        }

        driver.setNom(driverDetails.getNom());
        driver.setPrenom(driverDetails.getPrenom());
        driver.setTelephone(driverDetails.getTelephone());
        driver.setEmail(driverDetails.getEmail());
        driver.setVehicule(driverDetails.getVehicule());
        driver.setNumeroPermis(driverDetails.getNumeroPermis());
        driver.setDisponible(driverDetails.getDisponible());

        return driverRepository.save(driver);
    }

    // Supprimer un chauffeur
    public void deleteDriver(Long id) {
        Driver driver = getDriverById(id);
        driverRepository.delete(driver);
    }

    // Changer la disponibilité d'un chauffeur
    public Driver toggleAvailability(Long id) {
        Driver driver = getDriverById(id);
        driver.setDisponible(!driver.getDisponible());
        return driverRepository.save(driver);
    }
}