# CRM Backend API

Backend API pour le système CRM avec Express.js et MongoDB.

## 🚀 Installation

1. **Installer les dépendances :**
```bash
npm install
```

2. **Configurer l'environnement :**
- Copier `config.env` et modifier les valeurs si nécessaire
- S'assurer que MongoDB est démarré localement

3. **Créer un utilisateur par défaut :**
```bash
npm run create-user
```

## 📋 Scripts disponibles

- `npm start` - Démarrer le serveur en production
- `npm run dev` - Démarrer le serveur en développement avec nodemon
- `npm run create-user` - Créer un utilisateur par défaut
- `npm run test-api` - Tester l'API

## 🔧 Configuration

### Variables d'environnement (config.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/farouk-crm-erp
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

## 📡 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `GET /api/auth/me` - Informations utilisateur connecté
- `POST /api/auth/logout` - Déconnexion

### Santé
- `GET /api/health` - Vérification de l'état du serveur

## 👤 Utilisateur par défaut

Après avoir exécuté `npm run create-user` :
- **Email :** admin@crm.com
- **Mot de passe :** admin123
- **Rôle :** super_admin

## 🔒 Sécurité

- Mots de passe hashés avec bcryptjs (salt rounds: 12)
- JWT tokens avec expiration de 24h
- Validation des données d'entrée
- CORS configuré pour le développement

## 🗄️ Base de données

- **Nom :** farouk-crm-erp
- **Collection :** users
- **Schéma :** User avec validation Mongoose

## 🚀 Démarrage

1. Démarrer MongoDB localement
2. Exécuter `npm run create-user` pour créer l'utilisateur
3. Démarrer le serveur avec `npm run dev`
4. Le serveur sera disponible sur http://localhost:5000