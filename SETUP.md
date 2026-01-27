# 🚀 Guide de Démarrage Rapide

## Installation

```bash
cd events_frontend
npm install
```

## Configuration

1. Créer le fichier `.env.local` à la racine :
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=Gestion d'Événements Audiovisuels
```

2. **Important** : Assurez-vous que le backend est en cours d'exécution sur le port 3000

## Démarrage

```bash
# Mode développement
npm run dev

# Build production
npm run build
npm run start
```

L'application sera accessible sur **http://localhost:3001**

## Première Connexion

1. Accédez à `http://localhost:3001`
2. Vous serez redirigé vers `/login`
3. Connectez-vous avec vos identifiants
4. Vous serez redirigé vers le dashboard

## Structure des Routes

- `/` - Redirection vers dashboard ou login
- `/login` - Page de connexion
- `/dashboard` - Tableau de bord principal
- `/events` - Liste des événements
- `/events/new` - Créer un événement
- `/equipment` - Liste du matériel
- `/users` - Gestion des utilisateurs
- `/maintenance` - Gestion des maintenances
- `/transport` - Gestion du transport
- `/whatsapp` - Messages WhatsApp

## Rôles et Permissions

### ADMIN 👑
- Accès complet à tous les modules
- Gestion des utilisateurs
- Gestion du transport
- Envoi de messages WhatsApp

### MAINTENANCE 🔧
- Accès au matériel
- Gestion des maintenances
- Scanner QR codes
- Modification des statuts matériel

### TECHNICIEN 👷
- Vue des événements assignés
- Accès au matériel (sans prix)
- Scanner QR pour validation
- Téléchargement des documents

## Dépannage

### Erreur de connexion API
- Vérifiez que le backend est démarré
- Vérifiez l'URL dans `.env.local`
- Vérifiez les CORS dans le backend

### Erreur de build
```bash
# Nettoyer et réinstaller
rm -rf .next node_modules
npm install
npm run build
```

### Problème de tokens
- Videz le localStorage du navigateur
- Reconnectez-vous

## Support

Pour toute question, consultez :
- `README.md` - Documentation complète
- `PROJECT_SUMMARY.md` - Résumé du projet
- Documentation du backend dans `Events_backend/docs/`
