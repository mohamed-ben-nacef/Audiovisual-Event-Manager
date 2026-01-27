# Gestion d'Événements Audiovisuels - Frontend

Application web Next.js pour la gestion complète d'une entreprise de location de matériel audiovisuel.

## 🚀 Technologies

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (State Management)
- **React Hook Form** + **Zod** (Form validation)
- **Axios** (API client)
- **Lucide React** (Icons)

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Backend API en cours d'exécution (port 3000 par défaut)

## 🛠️ Installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer les variables d'environnement**
Créez un fichier `.env.local` à la racine du projet :
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=Gestion d'Événements Audiovisuels
```

3. **Démarrer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3001](http://localhost:3001)

## 📁 Structure du Projet

```
events_frontend/
├── app/                    # Pages Next.js (App Router)
│   ├── dashboard/         # Tableau de bord
│   ├── events/            # Module Événements
│   ├── equipment/         # Module Matériel
│   ├── users/             # Module Utilisateurs
│   ├── maintenance/       # Module Maintenance
│   ├── transport/         # Module Transport
│   ├── whatsapp/         # Module WhatsApp
│   └── login/             # Page de connexion
├── components/            # Composants React
│   ├── ui/               # Composants UI réutilisables
│   └── layout/           # Composants de layout
├── lib/                   # Utilitaires et API client
├── stores/                # Stores Zustand
├── types/                 # Types TypeScript
└── public/                # Fichiers statiques
```

## 🎯 Fonctionnalités

### ✅ Modules Implémentés

1. **Authentification**
   - Connexion / Déconnexion
   - Gestion des tokens JWT
   - Protection des routes

2. **Tableau de bord**
   - Vue d'ensemble des statistiques
   - Événements à venir
   - Matériel en location/maintenance

3. **Gestion des Événements**
   - Liste des événements
   - Création d'événements
   - Filtres par statut et catégorie

4. **Gestion du Matériel**
   - Liste du matériel
   - Filtres par catégorie et statut
   - Recherche par nom/référence

5. **Gestion des Utilisateurs**
   - Liste des utilisateurs
   - Gestion des rôles (ADMIN, MAINTENANCE, TECHNICIEN)

6. **Maintenance**
   - Liste des maintenances
   - Suivi des réparations

7. **Transport**
   - Gestion des véhicules
   - Planning des transports

8. **WhatsApp**
   - Historique des messages
   - Envoi de messages

## 🔐 Rôles Utilisateurs

- **ADMIN** : Accès complet à tous les modules
- **MAINTENANCE** : Gestion du matériel et maintenances
- **TECHNICIEN** : Vue des événements assignés et matériel

## 🔌 Configuration API

L'application se connecte au backend via l'URL définie dans `NEXT_PUBLIC_API_URL`.

Le client API (`lib/api.ts`) gère automatiquement :
- L'ajout du token JWT aux requêtes
- Le rafraîchissement des tokens
- La gestion des erreurs

## 📝 Scripts Disponibles

```bash
npm run dev      # Démarre le serveur de développement
npm run build    # Compile l'application pour la production
npm run start    # Démarre le serveur de production
npm run lint     # Vérifie le code avec ESLint
```

## 🎨 Personnalisation

### Couleurs et Styles

Les styles sont définis avec Tailwind CSS. Vous pouvez personnaliser les couleurs dans `tailwind.config.ts` ou directement dans les composants.

### Composants UI

Les composants UI réutilisables sont dans `components/ui/`. Ils suivent un système de design cohérent et peuvent être facilement personnalisés.

## 🚧 Développement Futur

- [ ] Scanner QR code pour maintenance
- [ ] Génération de QR codes pour matériel
- [ ] Export PDF des documents (plan de feu, bons de sortie)
- [ ] Interface technicien dédiée
- [ ] Calendrier des événements
- [ ] Notifications en temps réel
- [ ] Mode sombre

## 📄 Licence

Ce projet est développé pour la gestion d'événements audiovisuels.

## 👥 Support

Pour toute question ou problème, contactez l'équipe de développement.
