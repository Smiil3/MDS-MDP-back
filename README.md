# Mecanoo — Backend API

API REST du projet Mecanoo, plateforme de mise en relation entre automobilistes et garagistes indépendants.

## Stack technique

- **Runtime** : Node.js
- **Framework** : Express
- **Langage** : TypeScript
- **ORM** : Prisma
- **Base de données** : MySQL 8.4
- **Authentification** : JWT
- **Validation** : Joi
- **Hashage** : Bcrypt
- **Géocodage** : Nominatim (OpenStreetMap avec Leaflet.js)
- **Suggestions d'adresses** : API Adresse — Base Adresse Nationale (data.gouv.fr)
- **Recherche SIRET** : API Recherche Entreprises (data.gouv.fr)
- **Emailing** : Mailjet
- **CI/CD** : GitHub Actions + Docker + K3s

## Architecture

Le projet suit une Architecture en couches (N-Tier) organisée en 3 couches :
HTTP Request
│
▼
Controller   — parse req, retourne res, catch erreurs domaine
│
▼
Service      — logique métier : règles, calculs, orchestration
│
▼
Repository   — accès données uniquement : Prisma, transactions

## Installation

### Prérequis

- Node.js >= 18
- MySQL 8.4

### Démarrage

```bash
git clone [url-repo-backend]
cd [repo-backend]
npm install
cp .env.example .env   # renseigner les variables d'environnement
npx prisma migrate deploy
npm run dev
```

## Déploiement

Le backend est déployé sur un VPS (`vps114748.serveur-vps.net`) via K3s (Kubernetes léger). L'exposition publique est assurée par Traefik avec certificat SSL généré automatiquement.

Le pipeline CI/CD GitHub Actions se déclenche à chaque push sur main et exécute dans l'ordre :
1. Checkout du repository
2. Connexion au GitHub Container Registry
3. Configuration de Docker Buildx
4. Build et push de l'image Docker
5. Copie des manifests Kubernetes sur le VPS
6. Déploiement sur K3s

## Sécurité & RGPD

- Authentification par JWT avec access token (3h) et refresh token (7 jours)
- Mots de passe hashés avec bcrypt
- Validation des données entrantes avec Joi sur chaque endpoint
- Middleware d'autorisation basé sur les rôles (Driver et Mechanic)
- Variables d'environnement sensibles stockées dans des Secrets Kubernetes
- Droit à la modification et la suppression des données d'un utilisateur
- Minimisation des données : seules les informations nécessaires sont collectées