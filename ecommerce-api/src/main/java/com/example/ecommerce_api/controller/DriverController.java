package com.example.ecommerce_api.controller;

import com.example.ecommerce_api.entity.Driver;
import com.example.ecommerce_api.service.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class DriverController {

    @Autowired
    private DriverService driverService;

    // Créer un chauffeur
    @PostMapping
    public Driver createDriver(@RequestBody Driver driver) {
        return driverService.createDriver(driver);
    }

    // Récupérer tous les chauffeurs
    @GetMapping
    public List<Driver> getAllDrivers() {
        return driverService.getAllDrivers();
    }

    // Récupérer un chauffeur par ID
    @GetMapping("/{id}")
    public Driver getDriverById(@PathVariable Long id) {
        return driverService.getDriverById(id);
    }

    // Récupérer les chauffeurs disponibles
    @GetMapping("/available")
    public List<Driver> getAvailableDrivers() {
        return driverService.getAvailableDrivers();
    }

    // Mettre à jour un chauffeur
    @PutMapping("/{id}")
    public Driver updateDriver(@PathVariable Long id, @RequestBody Driver driverDetails) {
        return driverService.updateDriver(id, driverDetails);
    }

    // Supprimer un chauffeur
    @DeleteMapping("/{id}")
    public Map<String, String> deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        Map<String, String> response = Map.of(
            "message", "Chauffeur supprimé avec succès",
            "status", "SUCCESS"
        );
        return response;
    }

    // Changer la disponibilité d'un chauffeur
    @PutMapping("/{id}/toggle-availability")
    public Driver toggleAvailability(@PathVariable Long id) {
        return driverService.toggleAvailability(id);
    }
}