# 💬 ChatLive - Messagerie Instantanée Moderne

[![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?logo=nuxt&logoColor=white&style=flat-square)](https://nuxt.com)
[![Nuxt UI](https://img.shields.io/badge/Nuxt%20UI-v4.x-00DC82?logo=nuxt&logoColor=white&style=flat-square)](https://ui.nuxt.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-PG-C5F74F?logo=drizzle&style=flat-square)](https://orm.drizzle.team)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-4169E1?logo=postgresql&logoColor=white&style=flat-square)](https://www.postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org)

**ChatLive** est une plateforme de messagerie instantanée moderne, performante et épurée inspirée de Discord et Slack. Conçue avec une architecture modulaire de haut niveau sous **Nuxt 4** et **Nuxt UI v4**, elle offre une expérience utilisateur ultra-fluide grâce à des transitions progressives, un mode sombre dynamique et une réactivité instantanée.

---

## ✨ Fonctionnalités Clés

*   **🏢 Multi-Espaces (Serveurs) :** Créez des serveurs dédiés pour regrouper vos communautés.
*   **#️⃣ Salons Thématiques (Canaux) :** Ajoutez des salons de discussion dans chaque serveur avec normalisation automatique des noms (ex : `"Général Chat"` ➔ `"general-chat"`).
*   **💬 Discussion en Temps Réel :** Messagerie interactive fluide avec gestion automatique du défilement (auto-scroll intelligent).
*   **🗑️ Suppression contextuelle :** Possibilité de supprimer vos propres messages en temps réel. Un bouton rouge poubelle apparaît au survol uniquement sur vos messages.
*   **🌓 Mode Sombre Dynamique :** Commutateur de thèmes intégré à l'en-tête, préservant vos préférences de couleur.
*   **⏳ États de Chargement Premium :** Système d'indicateurs de chargement squelettes (`USkeleton`) pour éviter les décalages visuels brusques (Layout Shifts).
*   **🔐 Authentification Hybride :** Connexion sécurisée avec GitHub OAuth ou connexion de développement instantanée en local via **Nuxt Auth Utils**.

---

## 🛠️ Stack Technique

*   **Framework Applicatif :** [Nuxt 4](https://nuxt.com) (Mode SSR, structure moderne de dossiers `app/` & auto-imports avancés).
*   **Composants & Design :** [Nuxt UI v4](https://ui.nuxt.com) avec [Tailwind CSS v4](https://tailwindcss.com) intégré (design premium, icônes intégrées, transitions animées et verre dépoli / glassmorphism).
*   **Base de Données :** [PostgreSQL](https://www.postgresql.org) hébergé sous conteneur Docker.
*   **ORM (Object-Relational Mapping) :** [Drizzle ORM](https://orm.drizzle.team) (requêtes typées, performances brutes et migrations robustes).
*   **Gestion des États :** [Pinia](https://pinia.vuejs.org) (Store centralisé, hautement typé et synchronisé avec le polling des messages).
*   **Authentification :** `nuxt-auth-utils` pour la gestion transparente et sécurisée des sessions de cookies utilisateur.

---

## 📂 Architecture Réduite du Projet

La structure respecte la nouvelle convention de structure Nuxt 4 :

```
├── app/
│   ├── components/
│   │   ├── chat/               # Composants du chat (Sidebars, Header, Input, Squelettes)
│   │   └── modals/             # Modales de création (Serveurs et Salons)
│   ├── composables/            # Composables partagés (ex: gestion du scroll réactif)
│   ├── layouts/                # Layouts globaux
│   ├── pages/                  # Pages applicatives (Connexion, Index de discussion)
│   ├── stores/                 # Logique d'état globale centralisée Pinia (chat.ts)
│   └── types/                  # Déclarations de typage TypeScript strictes
├── server/
│   ├── api/                    # Endpoints d'API Nitro sécurisés (serveurs, salons, messages)
│   ├── database/               # Fichiers Drizzle (schémas PostgreSQL, migrations de données)
│   ├── routes/                 # Processus d'authentification (GitHub / Dev local)
│   └── utils/                  # Outils d'initialisation de la base de données (drizzle.ts)
└── nuxt.config.ts              # Configuration Nuxt
```

---

## 🚀 Installation & Lancement en Local

### 1. Prérequis
Assurez-vous d'avoir installé :
*   [Node.js](https://nodejs.org) (v18.x ou supérieur recommandé)
*   [Docker](https://www.docker.com) et Docker Compose (pour la base de données)

### 2. Cloner le Projet & Installer les Dépendances
```bash
# Installer les dépendances
npm install
```

### 3. Configurer l'Environnement
Créez un fichier `.env` à la racine du projet et configurez vos variables (Drizzle configurera le reste automatiquement) :
```env
# URL de connexion à la base de données PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatlive"

# Clé de chiffrement de session (générée automatiquement ou à définir)
NUXT_SESSION_PASSWORD="un-mot-de-passe-tres-long-et-securise-de-32-caracteres"

# Configuration facultative (pour l'authentification GitHub)
# NUXT_OAUTH_GITHUB_CLIENT_ID=""
# NUXT_OAUTH_GITHUB_CLIENT_SECRET=""
```

### 4. Démarrer la Base de Données
```bash
# Démarrer le conteneur PostgreSQL
docker compose up -d
```

### 5. Lancer les Migrations Drizzle
```bash
# Synchroniser le schéma de base de données
npx drizzle-kit push
```

### 6. Lancer le Serveur de Développement
```bash
# Démarrer le projet
npm run dev
```
L'application est maintenant accessible sur `http://localhost:3000`. Vous pouvez utiliser le bouton **Connexion Dev (Test Local)** pour vous connecter instantanément sans clé GitHub !

---

## 🚦 Qualité & Validation du Code

Le projet intègre une suite de validations strictes pour garantir la qualité du code :

*   **TypeScript Validation :**
    ```bash
    npm run typecheck
    ```
*   **Qualité Stylistique (Linter) :**
    ```bash
    npm run lint
    ```
