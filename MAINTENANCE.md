# 🛠️ Guide de Maintenance & Architecture — ChatLive

Cette documentation regroupe l'ensemble des fonctionnalités et architectures mises en place lors de la mise à niveau professionnelle de **ChatLive**. L'objectif est de vous fournir une cartographie complète du projet afin de faciliter sa maintenance à long terme et d'assurer son évolution dans les meilleures conditions.

---

## 🗺️ Index des 6 Catégories de Maintenance

1. [🔐 Phase 1 — Sécurité & Validation de Données](#-phase-1--securite--validation-de-donnees)
2. [🏗️ Phase 2 — Architecture, Flexibilité & Robustesse](#%EF%B8%8F-phase-2--architecture-flexibilite--robustesse)
3. [⚡ Phase 3 — Performance & Scalabilité](#-phase-3--performance--scalabilite)
4. [📐 Phase 4 — Qualité de Code, SEO & Onboarding](#-phase-4--qualite-de-code-seo--onboarding)
5. [🚀 Phase 5 — DevOps & CI/CD](#-phase-5--devops--cicd)
6. [🎨 Phase 6 — Expérience Utilisateur (UX), Mobile & Accessibilité](#-phase-6--experience-utilisateur-ux-mobile--accessibilite)

---

## 🔐 Phase 1 — Sécurité & Validation de Données

Toutes les fondations de sécurité ont été renforcées pour protéger les données utilisateurs (RGPD) et prévenir les failles OWASP les plus courantes.

### 1.1 Chiffrement de bout-en-bout (Authentifié)
* **Fichier clé** : [server/utils/encryption.ts](file:///home/romrd/Documents/projects/ChatLive/server/utils/encryption.ts)
* **Principe** : Chiffrement symétrique des messages avec l'algorithme robuste **AES-256-GCM**.
* **Fonctionnement** :
  * Chaque message est chiffré avant insertion en base et déchiffré à la lecture API.
  * Format de stockage moderne : `enc2:iv:authTag:ciphertext`. L'`authTag` prévient toute altération des données chiffrées.
  * Rétrocompatibilité : Décrypte également l'ancien format **AES-256-CBC** (`enc:iv:ciphertext`) pour éviter de corrompre les anciens messages en base.
  * Clé de chiffrement : `MESSAGE_ENCRYPTION_KEY` (avec fallback sur `NUXT_SESSION_PASSWORD`).
* **⚠️ Maintenance** : La clé est **obligatoire en production** (le serveur crashe au démarrage si elle est absente, pour éviter de stocker des messages en clair).

### 1.2 Schémas de Validation Stricts (Zod)
* **Fichier clé** : [server/utils/validators.ts](file:///home/romrd/Documents/projects/ChatLive/server/utils/validators.ts)
* **Principe** : Centralisation de la validation de chaque payload entrant (body et query params).
* **Endpoints protégés (10+)** : 
  * Création/Recherche de serveurs et salons.
  * Envoi et suppression de messages et DMs.
  * Gestion des demandes d'amis et mise à jour de profil.
* **⚠️ Maintenance** : Pour tout nouvel endpoint back-end, déclarez un schéma dans `validators.ts` et utilisez-le avec `readValidatedBody(event, Schema.safeParse)` ou équivalent.

### 1.3 Limiteur de Débit (Rate Limiting)
* **Fichier clé** : [server/utils/rateLimit.ts](file:///home/romrd/Documents/projects/ChatLive/server/utils/rateLimit.ts)
* **Principe** : Protection in-memory contre le spam, le brute force ou le déni de service (DoS).
* **Fonctionnement** :
  * Détermine le nombre de requêtes par clé unique (ex: `userId:endpoint`) sur une fenêtre glissante.
  * Une tâche automatique en arrière-plan (`setInterval`) nettoie les entrées expirées toutes les minutes pour éviter les fuites de mémoire.
  * Lève une erreur `429 Too Many Requests` avec l'en-tête `Retry-After` si la limite est dépassée.
* **⚠️ Maintenance/Scalabilité** : Pour un déploiement multi-serveurs ou sans état (Serverless / Vercel), remplacez ce stockage in-memory par un client **Redis** (par exemple `@upstash/redis` ou `ioredis`).

### 1.4 Protection contre les Injections SQL & RGPD
* **Fichier clé** : [server/api/users/search.get.ts](file:///home/romrd/Documents/projects/ChatLive/server/api/users/search.get.ts)
* **Principe** :
  * Échappement explicite des caractères spéciaux (`%`, `_`, `\`) sur les requêtes de recherche textuelle SQL (`LIKE`).
  * Suppression de la recherche par e-mail dans la liste publique pour respecter les principes de protection de la vie privée (RGPD).

### 1.5 Dev Login Conditionnel
* **Fichier clé** : [app/pages/login.vue](file:///home/romrd/Documents/projects/ChatLive/app/pages/login.vue) / [nuxt.config.ts](file:///home/romrd/Documents/projects/ChatLive/nuxt.config.ts)
* **Principe** : Le bouton de connexion rapide en un clic ("Dev Login") n'est rendu que si `runtimeConfig.public.devLogin` est activé, évitant ainsi toute intrusion accidentelle en production.

---

## 🏗️ Phase 2 — Architecture, Flexibilité & Robustesse

La structure de l'application a été standardisée pour être modulaire, facile à lire et résiliente aux pertes réseau.

### 2.1 Store Pinia Réécrit & WebSocket Robuste
* **Fichier clé** : [app/stores/chat.ts](file:///home/romrd/Documents/projects/ChatLive/app/stores/chat.ts)
* **Principe** : Centralisation complète de la logique métier (gestion des listes de serveurs, messages, amis) et de la connexion WebSocket.
* **Fonctionnalités WebSocket** :
  * **Exponential Backoff** : En cas de déconnexion réseau, le client tente de se reconnecter après un délai progressif (de 1s minimum à 30s maximum) pour éviter d'inonder le serveur.
  * **Heartbeat Ping/Pong** : Envoi régulier d'un ping toutes les 30s. Si la connexion est rompue silencieusement (socket zombie), elle est détectée et reconnectée immédiatement.
  * **Switch Dispatcher** : Le traitement des événements entrants WebSocket utilise un bloc `switch` structuré par type d'action (`message:new`, `dm:message:new`, `presence`, etc.) plutôt qu'une cascade de `if/else`.
  * **Anti-Spam de requêtes** : Temporisation (`debounce` de 1,5s) sur la réception des mises à jour de DMs pour éviter d'inonder l'API de requêtes redondantes.

### 2.2 Gestion Unique des Erreurs (Toast)
* **Fichier clé** : [app/utils/errorHandler.ts](file:///home/romrd/Documents/projects/ChatLive/app/utils/errorHandler.ts)
* **Principe** : Fonction utilitaire globale `handleApiError` pour intercepter les erreurs d'API (H3, Nitro, ofetch) et afficher une notification toast standardisée.
* **⚠️ Maintenance** : Ne pas implémenter de gestion d'erreur toast ad-hoc dans les composants, préférez toujours `handleApiError(error, 'Message de secours')`.

### 2.3 Gestion Centralisée des Modals
* **Fichier clé** : [app/composables/useModals.ts](file:///home/romrd/Documents/projects/ChatLive/app/composables/useModals.ts)
* **Principe** : Remplacement des variables éparpillées par un état global réactif (`useModals`) pour ouvrir/fermer les modales (ex: créer un salon, inviter un membre, modifier son profil).

### 2.4 Middleware d'Autorisation DRY
* **Fichier clé** : [server/utils/authorization.ts](file:///home/romrd/Documents/projects/ChatLive/server/utils/authorization.ts)
* **Principe** : Fonctions d'autorisation partagées (`requireServerMember` et `requireChannelAccess`) pour vérifier d'un coup l'authentification et l'adhésion au serveur d'un utilisateur.

### 2.5 Types Partagés (Single Source of Truth)
* **Fichiers clés** : [shared/types/chat.ts](file:///home/romrd/Documents/projects/ChatLive/shared/types/chat.ts) et [shared/types/auth.d.ts](file:///home/romrd/Documents/projects/ChatLive/shared/types/auth.d.ts)
* **Principe** : Les structures complexes de données (Serveurs, Messages, Statuts d'amitié) sont définies dans le dossier `shared/` pour être importées à la fois par le front-end Nuxt et le back-end Nitro.

---

## ⚡ Phase 3 — Performance & Scalabilité

L'application a été optimisée au niveau de la base de données et des flux d'échange de données pour supporter des milliers d'utilisateurs actifs.

### 3.1 Indexes SQL & Contraintes
* **Fichier clé** : [server/database/schema.ts](file:///home/romrd/Documents/projects/ChatLive/server/database/schema.ts)
* **Principe** : 8 index SQL ciblés ajoutés sur PostgreSQL pour transformer les requêtes de recherche séquentielle de O(N) à O(log N).
* **Index stratégiques** :
  * Clés étrangères : `server_id` et `channel_id` sur les salons et messages.
  * Tris chronologiques : `createdAt` sur les tables de messages et de DMs.
  * Relations uniques : Index unique composite `(serverId, userId)` sur `server_members` pour interdire les doublons en base.
  * Enum PostgreSQL : `pgEnum` pour le statut de relation d'amis (`pending`, `accepted`, `declined`).

### 3.2 Pagination par Curseur (Cursor-Based Pagination)
* **Fichiers clés** : `server/api/messages/index.get.ts` & `server/api/dms/messages.get.ts`
* **Principe** : La pagination par offset classique ralentit sur de grandes tables. Elle a été remplacée par une pagination par curseur temporel (`before` contenant la date ISO du plus ancien message actuellement chargé).
* **Avantage** : Charge des paquets de 50 messages à la fois. Le bouton "Charger plus" récupère les messages antérieurs au curseur de manière instantanée, indépendamment de la taille totale de l'historique.

### 3.3 Mises à jour Optimistes (Optimistic UI)
* **Fichier clé** : Store Pinia (`app/stores/chat.ts`) dans les méthodes `sendMessage` et `sendDm`.
* **Principe** : Dès que l'utilisateur clique sur "Envoyer", le message est inséré immédiatement dans l'UI avec un identifiant temporaire (`temp-xxxx`).
* **Fonctionnement** :
  * Si l'API valide l'envoi, le message temporaire est remplacé par sa version finale.
  * Si l'API échoue, le message temporaire est retiré de la liste et une alerte d'échec est déclenchée.
  * Résultat : Une fluidité visuelle instantanée pour l'utilisateur.

### 3.4 Pool de Connexions Drizzle
* **Fichier clé** : [server/utils/drizzle.ts](file:///home/romrd/Documents/projects/ChatLive/server/utils/drizzle.ts)
* **Principe** : Configuration du driver PostgreSQL `pg` pour limiter à un maximum de **10 connexions simultanées** par instance de serveur, protégeant ainsi la base de données de la saturation sous forte charge.

### 3.5 SQL `DISTINCT ON` pour la Liste de DMs
* **Fichier clé** : [server/api/dms/index.get.ts](file:///home/romrd/Documents/projects/ChatLive/server/api/dms/index.get.ts)
* **Principe** : Utilisation de la clause PostgreSQL `DISTINCT ON` pour récupérer d'un seul coup la liste des DMs triée par le dernier message échangé. Évite des dizaines de requêtes imbriquées.

---

## 📐 Phase 4 — Qualité de Code, SEO & Onboarding

L'application respecte les standards professionnels de développement web, de référencement et d'onboarding de nouveaux développeurs.

### 4.1 Référencement Naturel (SEO)
* **Fichiers clés** : [app/app.vue](file:///home/romrd/Documents/projects/ChatLive/app/app.vue) et [app/pages/login.vue](file:///home/romrd/Documents/projects/ChatLive/app/pages/login.vue)
* **Principe** : Balises OpenGraph et Twitter Card pour des partages premium sur les réseaux sociaux. Ajout de `useSeoMeta` et d'une langue de document dynamique (`htmlAttrs.lang`) configurée à `fr` par défaut.

### 4.2 Page d'Erreur Custom
* **Fichier clé** : [app/error.vue](file:///home/romrd/Documents/projects/ChatLive/app/error.vue)
* **Principe** : Remplacement de l'écran d'erreur par défaut de Nuxt par une interface soignée reprenant la charte graphique de ChatLive avec un bouton interactif de retour à l'accueil.

### 4.3 Onboarding (.env.example)
* **Fichier clé** : [.env.example](file:///home/romrd/Documents/projects/ChatLive/.env.example)
* **Principe** : Fichier modèle commenté décrivant chaque variable requise pour démarrer le projet localement (OAuth Github, Database URL, clés de session et de chiffrement).

---

## 🚀 Phase 5 — DevOps & CI/CD

Intégration d'outils d'automatisation pour garantir la stabilité et la qualité du code à chaque modification.

### 5.1 Pipeline GitHub Actions (CI)
* **Fichier clé** : [.github/workflows/ci.yml](file:///home/romrd/Documents/projects/ChatLive/.github/workflows/ci.yml)
* **Principe** : Intégration continue automatique à chaque push sur la branche principale ou lors d'une Pull Request.
* **Étapes de validation** :
  1. **Lint** : Validation des règles de style de code (ESLint).
  2. **Typecheck** : Vérification des types TypeScript (`vue-tsc --noEmit`).
  3. **Build** : Compilation de l'application Nuxt pour la production.

### 5.2 Renovate Configuration
* **Fichier clé** : [renovate.json](file:///home/romrd/Documents/projects/ChatLive/renovate.json)
* **Principe** : Outil de mise à jour automatique des dépendances configuré pour dédupliquer proprement les paquets npm (`npmDedupe: true`).

---

## 🎨 Phase 6 — Expérience Utilisateur (UX), Mobile & Accessibilité

L'application a été polie pour offrir une fluidité impeccable sur tous les terminaux et répondre aux critères modernes d'accessibilité.

### 6.1 Adaptabilité Mobile & Barre Burger
* **Fichiers clés** : [app/stores/chat.ts](file:///home/romrd/Documents/projects/ChatLive/app/stores/chat.ts) / [app/app.vue](file:///home/romrd/Documents/projects/ChatLive/app/app.vue)
* **Principe** : Barre latérale rétractable sur écran mobile.
* **Fonctionnement** :
  * Un bouton hamburger apparaît sur petit écran pour ouvrir/fermer la barre latérale.
  * Un overlay semi-transparent floute l'arrière-plan de l'espace de discussion lorsque le menu est ouvert.
  * La sélection d'un salon ou d'un DM ferme automatiquement l'overlay mobile.

### 6.2 Lien d'Évitement (Skip Links / Accessibilité a11y)
* **Fichier clé** : [app/app.vue](file:///home/romrd/Documents/projects/ChatLive/app/app.vue)
* **Principe** : Ajout d'un lien d'évitement caché destiné aux lecteurs d'écran et aux utilisateurs naviguant uniquement au clavier.
* **Fonctionnement** :
  * Apparaît lors du premier appui sur la touche `Tab` ("Passer au contenu principal").
  * Permet de sauter immédiatement la navigation de gauche pour atterrir directement sur le fil de discussion (`#main-content`).

### 6.3 Indicateur de Chargement Global (UX Transitions)
* **Fichier clé** : [app/app.vue](file:///home/romrd/Documents/projects/ChatLive/app/app.vue)
* **Principe** : Ajout de `<NuxtLoadingIndicator>` au sommet de l'écran pour indiquer visuellement le chargement de données lors des transitions de pages.

### 6.4 Sécurisation UX (Confirmation de Suppression)
* **Fichier clé** : [app/components/chat/MessageItem.vue](file:///home/romrd/Documents/projects/ChatLive/app/components/chat/MessageItem.vue)
* **Principe** : La suppression d'un message requiert une confirmation visuelle en un clic (apparition d'un bouton rouge de validation rapide) pour éviter les fausses manipulations.

---

## 🚀 Synthèse : Que devez-vous maintenir au quotidien ?

1. **Les variables d'environnement** : Assurez-vous d'avoir configuré les clés dans votre hébergeur (ex: Vercel/Railway) en vous référant au [.env.example](file:///home/romrd/Documents/projects/ChatLive/.env.example).
2. **Les Migrations de Base de données** : En cas de changement de structure dans [server/database/schema.ts](file:///home/romrd/Documents/projects/ChatLive/server/database/schema.ts), n'oubliez pas de lancer :
   ```bash
   npm run db:generate
   npx drizzle-kit migrate
   ```
3. **Le fichier de types** [shared/types/chat.ts](file:///home/romrd/Documents/projects/ChatLive/shared/types/chat.ts) : C'est le contrat d'échange entre le front et le back. Mettez-le à jour dès que vos modèles d'API évoluent.
4. **La pipeline CI/CD** : Si vous ajoutez de nouvelles règles ou changez la structure du dossier, assurez-vous que `npm run lint` et `npm run typecheck` restent parfaits avant chaque push.
