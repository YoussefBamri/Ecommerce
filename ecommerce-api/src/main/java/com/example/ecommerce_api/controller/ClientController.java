package com.example.ecommerce_api.controller;

import com.example.ecommerce_api.entity.Client;
import com.example.ecommerce_api.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "http://localhost:3000")
public class ClientController {

    @Autowired
    private ClientService clientService;

    // ➕ Ajouter un client
    @PostMapping
    public Client creerClient(@RequestBody Client client) {
        return clientService.creerClient(client);
    }

    // 📋 Liste des clients
    @GetMapping
    public List<Client> getAllClients() {
        return clientService.getAllClients();
    }

    // 🔍 Détails d’un client
    @GetMapping("/{id}")
    public Client getClientById(@PathVariable Long id) {
        return clientService.getClientById(id);
    }

    // ✏️ Mettre à jour un client
    @PutMapping("/{id}")
    public Client updateClient(@PathVariable Long id, @RequestBody Client client) {
        return clientService.updateClient(id, client);
    }

    // 🗑️ Supprimer un client
    @DeleteMapping("/{id}")
    public void supprimerClient(@PathVariable Long id) {
        clientService.supprimerClient(id);
    }
}
