package com.example.ecommerce_api.service;

import com.example.ecommerce_api.dao.ClientRepository;
import com.example.ecommerce_api.entity.Client;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    public Client creerClient(Client client) {
        return clientRepository.save(client);
    }

    public Client getClientById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client non trouvé avec ID : " + id));
    }

    public Client getClientByEmail(String email) {
        return clientRepository.findByEmail(email);
    }

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Client updateClient(Long id, Client updatedClient) {
        Client existing = getClientById(id);
        existing.setNom(updatedClient.getNom());
        existing.setEmail(updatedClient.getEmail());
        existing.setTelephone(updatedClient.getTelephone());
        existing.setAdresseLivraison(updatedClient.getAdresseLivraison());
        return clientRepository.save(existing);
    }

    public void supprimerClient(Long id) {
        clientRepository.deleteById(id);
    }
}
