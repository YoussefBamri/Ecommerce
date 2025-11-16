# Configuration de l'envoi d'email

## 📧 Configuration requise

Pour activer l'envoi d'email réel, vous devez configurer vos identifiants SMTP dans `application.properties`.

## 🔧 Configuration Gmail (Recommandé pour les tests)

1. **Activez l'authentification à deux facteurs** sur votre compte Gmail
2. **Générez un mot de passe d'application** :
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Mail" et "Autre (nom personnalisé)"
   - Entrez "TechStore" et générez le mot de passe
   - Copiez le mot de passe généré (16 caractères)

3. **Modifiez `application.properties`** :
```properties
spring.mail.username=votre-email@gmail.com
spring.mail.password=votre-mot-de-passe-app-16-caracteres
app.email.from=votre-email@gmail.com
```

## 🔧 Configuration avec d'autres serveurs SMTP

### Outlook/Hotmail
```properties
spring.mail.host=smtp-mail.outlook.com
spring.mail.port=587
spring.mail.username=votre-email@outlook.com
spring.mail.password=votre-mot-de-passe
```

### Yahoo
```properties
spring.mail.host=smtp.mail.yahoo.com
spring.mail.port=587
spring.mail.username=votre-email@yahoo.com
spring.mail.password=votre-mot-de-passe-app
```

### Serveur SMTP personnalisé
```properties
spring.mail.host=smtp.votre-serveur.com
spring.mail.port=587
spring.mail.username=votre-email@votre-domaine.com
spring.mail.password=votre-mot-de-passe
```

## ✅ Test

Après configuration, redémarrez le backend et testez une commande. L'email sera envoyé automatiquement au client.

## 📝 Note

L'email contient tous les détails de la commande formatés en HTML (comme un PDF) :
- Numéro de commande
- Date et statut
- Informations client
- Liste des articles avec quantités et prix
- Total de la commande

