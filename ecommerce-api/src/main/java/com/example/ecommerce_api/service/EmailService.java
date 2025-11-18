package com.example.ecommerce_api.service;

import com.example.ecommerce_api.entity.Commande;
import com.example.ecommerce_api.entity.LigneCommande;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.email.from:no-reply@techstore.com}")
    private String fromEmail;

    @Value("${app.email.from-name:TechStore}")
    private String fromName;

    /**
     * Envoie un email de confirmation de commande au client
     * L'email contient tous les détails de la commande formatés comme un PDF
     */
    public void envoyerEmailConfirmation(Commande commande) {
        // Vérifier si JavaMailSender est disponible
        if (mailSender == null) {
            System.out.println("⚠️ JavaMailSender n'est pas configuré. Email non envoyé.");
            System.out.println("========================================");
            System.out.println("📧 EMAIL DE CONFIRMATION DE COMMANDE (Mode simulation)");
            System.out.println("========================================");
            System.out.println("À: " + commande.getClient().getEmail());
            System.out.println("Sujet: Confirmation de commande #" + commande.getId());
            System.out.println("\nBonjour " + commande.getClient().getNom() + ",");
            System.out.println("\nVotre commande #" + commande.getId() + " a été confirmée !");
            System.out.println("\nDétails de la commande:");
            System.out.println("Date: " + commande.getDateCommande());
            System.out.println("Total: " + commande.getTotal() + " TND");
            System.out.println("\nArticles:");
            for (LigneCommande ligne : commande.getLignesCommande()) {
                System.out.println("  - " + ligne.getProduit().getNom() + 
                                 " x " + ligne.getQuantite() + 
                                 " = " + (ligne.getPrixUnitaire() * ligne.getQuantite()) + " TND");
            }
            System.out.println("\nMerci pour votre achat !");
            System.out.println("========================================");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String toEmail = commande.getClient().getEmail();
            String subject = "Confirmation de commande #" + commande.getId() + " - TechStore";
            String htmlContent = genererContenuEmailHTML(commande);

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML

            mailSender.send(message);
            System.out.println("✅ Email envoyé avec succès à: " + toEmail);

        } catch (MessagingException e) {
            System.err.println("❌ Erreur lors de l'envoi de l'email: " + e.getMessage());
            e.printStackTrace();
            // Ne pas faire échouer la commande si l'email échoue
        } catch (Exception e) {
            System.err.println("❌ Erreur inattendue lors de l'envoi de l'email: " + e.getMessage());
            e.printStackTrace();
            // Ne pas faire échouer la commande si l'email échoue
        }
    }

    /**
     * Envoie une notification de changement de statut de commande
     */
    public void envoyerNotificationStatut(Commande commande, String ancienStatut, String nouveauStatut) {
        // Vérifier si JavaMailSender est disponible
        if (mailSender == null) {
            System.out.println("⚠️ JavaMailSender n'est pas configuré. Notification de statut non envoyée.");
            System.out.println("========================================");
            System.out.println("📧 NOTIFICATION DE STATUT DE COMMANDE (Mode simulation)");
            System.out.println("========================================");
            System.out.println("À: " + commande.getClient().getEmail());
            System.out.println("Sujet: Mise à jour du statut de commande #" + commande.getId());
            System.out.println("\nBonjour " + commande.getClient().getNom() + ",");
            System.out.println("\nLe statut de votre commande #" + commande.getId() + " a été mis à jour.");
            System.out.println("Statut précédent: " + ancienStatut);
            System.out.println("Nouveau statut: " + nouveauStatut);
            System.out.println("\n" + genererMessageStatut(nouveauStatut, commande));
            System.out.println("\nVous pouvez suivre votre commande à tout moment sur notre site.");
            System.out.println("========================================");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String toEmail = commande.getClient().getEmail();
            String subject = "Mise à jour du statut - Commande #" + commande.getId() + " - TechStore";
            String htmlContent = genererContenuEmailStatut(commande, ancienStatut, nouveauStatut);

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML

            mailSender.send(message);
            System.out.println("✅ Notification de statut envoyée avec succès à: " + toEmail);

        } catch (MessagingException e) {
            System.err.println("❌ Erreur lors de l'envoi de la notification de statut: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("❌ Erreur inattendue lors de l'envoi de la notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Génère un message personnalisé selon le nouveau statut
     */
    private String genererMessageStatut(String statut, Commande commande) {
        switch (statut) {
            case "CONFIRMED":
                return "Votre paiement a été confirmé et votre commande est maintenant en cours de préparation.";
            case "PROCESSING":
                return "Votre commande est en cours de préparation dans notre entrepôt.";
            case "SHIPPED":
                String trackingInfo = "";
                if (commande.getNumeroSuivi() != null && commande.getTransporteur() != null) {
                    trackingInfo = "\n\nNuméro de suivi: " + commande.getNumeroSuivi() +
                                 "\nTransporteur: " + commande.getTransporteur();
                    if (commande.getDateLivraisonEstimee() != null) {
                        trackingInfo += "\nLivraison estimée: " + commande.getDateLivraisonEstimee().toLocalDate();
                    }
                }
                return "Votre commande a été expédiée !" + trackingInfo;
            case "DELIVERED":
                return "Votre commande a été livrée avec succès. Merci pour votre confiance !";
            case "CANCELLED":
                return "Votre commande a été annulée. Pour toute question, n'hésitez pas à nous contacter.";
            default:
                return "Le statut de votre commande a été mis à jour: " + statut;
        }
    }

    /**
     * Génère le contenu HTML de l'email de notification de statut
     */
    private String genererContenuEmailStatut(Commande commande, String ancienStatut, String nouveauStatut) {
        StringBuilder html = new StringBuilder();

        html.append("<!DOCTYPE html>");
        html.append("<html lang='fr'>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }");
        html.append(".header { background-color: #2563eb; color: white; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 30px; }");
        html.append(".header h1 { margin: 0; font-size: 24px; }");
        html.append(".content { margin: 20px 0; }");
        html.append(".status-section { margin-bottom: 25px; padding: 15px; background-color: #f9fafb; border-radius: 5px; border-left: 4px solid #2563eb; }");
        html.append(".status-section h2 { color: #2563eb; margin-top: 0; font-size: 18px; }");
        html.append(".info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }");
        html.append(".info-label { font-weight: bold; color: #6b7280; }");
        html.append(".info-value { color: #111827; }");
        html.append(".tracking-info { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #f59e0b; }");
        html.append(".footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }");
        html.append(".btn { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class='container'>");

        // Header
        html.append("<div class='header'>");
        html.append("<h1>📦 Mise à jour de commande</h1>");
        html.append("<p style='margin: 10px 0 0 0;'>Votre commande a changé de statut</p>");
        html.append("</div>");

        // Salutation
        html.append("<div class='content'>");
        html.append("<p>Bonjour <strong>").append(commande.getClient().getNom()).append("</strong>,</p>");
        html.append("<p>Nous vous informons que le statut de votre commande a été mis à jour :</p>");
        html.append("</div>");

        // Status information
        html.append("<div class='status-section'>");
        html.append("<h2>🔄 Changement de statut</h2>");
        html.append("<div class='info-row'>");
        html.append("<span class='info-label'>Numéro de commande :</span>");
        html.append("<span class='info-value'><strong>#").append(commande.getId()).append("</strong></span>");
        html.append("</div>");
        html.append("<div class='info-row'>");
        html.append("<span class='info-label'>Statut précédent :</span>");
        html.append("<span class='info-value'>").append(ancienStatut).append("</span>");
        html.append("</div>");
        html.append("<div class='info-row'>");
        html.append("<span class='info-label'>Nouveau statut :</span>");
        html.append("<span class='info-value'><strong>").append(nouveauStatut).append("</strong></span>");
        html.append("</div>");
        html.append("</div>");

        // Status-specific message
        html.append("<div class='content'>");
        html.append("<p><strong>").append(genererMessageStatut(nouveauStatut, commande)).append("</strong></p>");
        html.append("</div>");

        // Tracking information for shipped orders
        if ("SHIPPED".equals(nouveauStatut) && commande.getNumeroSuivi() != null) {
            html.append("<div class='tracking-info'>");
            html.append("<h3 style='margin-top: 0; color: #92400e;'>📍 Informations de suivi</h3>");
            if (commande.getNumeroSuivi() != null) {
                html.append("<p><strong>Numéro de suivi:</strong> ").append(commande.getNumeroSuivi()).append("</p>");
            }
            if (commande.getTransporteur() != null) {
                html.append("<p><strong>Transporteur:</strong> ").append(commande.getTransporteur()).append("</p>");
            }
            if (commande.getDateLivraisonEstimee() != null) {
                html.append("<p><strong>Livraison estimée:</strong> ").append(commande.getDateLivraisonEstimee().toLocalDate()).append("</p>");
            }
            html.append("</div>");
        }

        // Call to action
        html.append("<div style='text-align: center; margin: 30px 0;'>");
        html.append("<a href='http://localhost:3000' class='btn'>Suivre ma commande</a>");
        html.append("</div>");

        // Footer
        html.append("<div class='footer'>");
        html.append("<p>Pour toute question concernant votre commande, n'hésitez pas à nous contacter.</p>");
        html.append("<p style='margin-top: 20px; font-size: 12px; color: #9ca3af;'>");
        html.append("Cet email est une notification automatique. Veuillez ne pas y répondre directement.");
        html.append("</p>");
        html.append("</div>");

        html.append("</div>");
        html.append("</body>");
        html.append("</html>");

        return html.toString();
    }

    /**
     * Génère le contenu HTML de l'email avec tous les détails de la commande
     */
    private String genererContenuEmailHTML(Commande commande) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html lang='fr'>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }");
        html.append(".header { background-color: #2563eb; color: white; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 30px; }");
        html.append(".header h1 { margin: 0; font-size: 24px; }");
        html.append(".content { margin: 20px 0; }");
        html.append(".section { margin-bottom: 25px; padding: 15px; background-color: #f9fafb; border-radius: 5px; }");
        html.append(".section h2 { color: #2563eb; margin-top: 0; font-size: 18px; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }");
        html.append(".info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }");
        html.append(".info-label { font-weight: bold; color: #6b7280; }");
        html.append(".info-value { color: #111827; }");
        html.append("table { width: 100%; border-collapse: collapse; margin: 15px 0; }");
        html.append("table th { background-color: #2563eb; color: white; padding: 12px; text-align: left; }");
        html.append("table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }");
        html.append("table tr:hover { background-color: #f9fafb; }");
        html.append(".total { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin-top: 20px; }");
        html.append(".total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #2563eb; }");
        html.append(".footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class='container'>");
        
        // Header
        html.append("<div class='header'>");
        html.append("<h1>✅ Commande Confirmée</h1>");
        html.append("<p style='margin: 10px 0 0 0;'>Merci pour votre achat !</p>");
        html.append("</div>");
        
        // Salutation
        html.append("<div class='content'>");
        html.append("<p>Bonjour <strong>").append(commande.getClient().getNom()).append("</strong>,</p>");
        html.append("<p>Votre commande a été confirmée avec succès. Voici les détails de votre commande :</p>");
        html.append("</div>");
        
        // Informations de la commande
        html.append("<div class='section'>");
        html.append("<h2>📋 Informations de la commande</h2>");
        html.append("<div class='info-row'>");
        html.append("<span class='info-label'>Numéro de commande :</span>");
        html.append("<span class='info-value'><strong>#").append(commande.getId()).append("</strong></span>");
        html.append("</div>");
        html.append("<div class='info-row'>");
        html.append("<span class='info-label'>Date de commande :</span>");
        html.append("<span class='info-value'>").append(commande.getDateCommande()).append("</span>");
        html.append("</div>");
        html.append("<div class='info-row'>");
        html.append("<span class='info-label'>Statut :</span>");
        html.append("<span class='info-value'><strong>").append(commande.getStatut()).append("</strong></span>");
        html.append("</div>");
        html.append("</div>");
        
        // Informations du client
        html.append("<div class='section'>");
        html.append("<h2>👤 Informations client</h2>");
        html.append("<div class='info-row'>");
        html.append("<span class='info-label'>Nom :</span>");
        html.append("<span class='info-value'>").append(commande.getClient().getNom()).append("</span>");
        html.append("</div>");
        html.append("<div class='info-row'>");
        html.append("<span class='info-label'>Email :</span>");
        html.append("<span class='info-value'>").append(commande.getClient().getEmail()).append("</span>");
        html.append("</div>");
        html.append("<div class='info-row'>");
        html.append("<span class='info-label'>Téléphone :</span>");
        html.append("<span class='info-value'>").append(commande.getClient().getTelephone()).append("</span>");
        html.append("</div>");
        if (commande.getClient().getAdresseLivraison() != null) {
            html.append("<div class='info-row'>");
            html.append("<span class='info-label'>Adresse de livraison :</span>");
            html.append("<span class='info-value'>");
            html.append(commande.getClient().getAdresseLivraison().getRue()).append(", ");
            html.append(commande.getClient().getAdresseLivraison().getVille()).append(" ");
            html.append(commande.getClient().getAdresseLivraison().getCodePostal()).append(", ");
            html.append(commande.getClient().getAdresseLivraison().getPays());
            html.append("</span>");
            html.append("</div>");
        }
        html.append("</div>");
        
        // Détails des articles
        html.append("<div class='section'>");
        html.append("<h2>🛒 Articles commandés</h2>");
        html.append("<table>");
        html.append("<thead>");
        html.append("<tr>");
        html.append("<th>Produit</th>");
        html.append("<th>Quantité</th>");
        html.append("<th>Prix unitaire</th>");
        html.append("<th>Total</th>");
        html.append("</tr>");
        html.append("</thead>");
        html.append("<tbody>");
        
        for (LigneCommande ligne : commande.getLignesCommande()) {
            double ligneTotal = ligne.getPrixUnitaire() * ligne.getQuantite();
            html.append("<tr>");
            html.append("<td>").append(ligne.getProduit().getNom()).append("</td>");
            html.append("<td>").append(ligne.getQuantite()).append("</td>");
            html.append("<td>").append(String.format("%.2f", ligne.getPrixUnitaire())).append(" TND</td>");
            html.append("<td><strong>").append(String.format("%.2f", ligneTotal)).append(" TND</strong></td>");
            html.append("</tr>");
        }
        
        html.append("</tbody>");
        html.append("</table>");
        html.append("</div>");
        
        // Total
        html.append("<div class='total'>");
        html.append("<div class='total-row'>");
        html.append("<span>Total de la commande :</span>");
        html.append("<span>").append(String.format("%.2f", commande.getTotal())).append(" TND</span>");
        html.append("</div>");
        html.append("</div>");
        
        // Footer
        html.append("<div class='footer'>");
        html.append("<p>Merci d'avoir choisi <strong>TechStore</strong> !</p>");
        html.append("<p>Pour toute question, n'hésitez pas à nous contacter.</p>");
        html.append("<p style='margin-top: 20px; font-size: 12px; color: #9ca3af;'>");
        html.append("Cet email est un reçu de confirmation. Veuillez le conserver pour vos archives.");
        html.append("</p>");
        html.append("</div>");
        
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
}

