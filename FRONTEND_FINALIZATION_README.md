# Frontend Finalization README

Ce document liste ce qui manque page par page pour finaliser le frontend FitConnect dans son état actuel.

## Etat global actuel

Le frontend est actuellement construit avec:
- React + Vite
- CSS global dans `src/App.css`
- Auth GraphQL connectée sur `http://localhost:4102/graphql`
- Gateway GraphQL connectée sur `http://localhost:4100/`
- Session JWT stockée en localStorage

Déjà connecté au backend:
- Authentification: connexion / inscription
- Dashboard: `me`, `myRanking`, `myGroups`, `myEvents`
- Events: `myEvents`, `groupEvents`, `createEvent`, `joinEvent`
- Community: `myGroups`, `group(id)`, `searchGroups`, `createGroup`, `joinGroup`
- Ranking: `leaderboard`, `myRanking`
- Chat: `myGroups`, `groupMessages`, `sendMessage`
- Profile: `me`, `myRanking`, `myGroups`, `myEvents`
- Planning: `myWorkoutSessions`, `completeWorkoutSession` (+ mapping `myEvents`/`myGroups`)
- Challenges: `challenges`, `challengeParticipants`

Encore en données mockées ou partiellement branché:
- Aucun écran principal restant en fallback métier bloquant

## 1. Page Auth

Fichier: `src/pages/AuthPage.jsx`

Déjà fait:
- Connexion réelle via `signIn`
- Inscription réelle via `signUp`
- Gestion loading
- Gestion erreurs
- Persistance session dans localStorage
- Déconnexion depuis la sidebar

Ce qu'il manque pour finaliser:
- Ajouter la gestion d'expiration du token JWT
- Gérer le cas `UNAUTHENTICATED` globalement et rediriger automatiquement vers Auth
- Ajouter une vraie action "Mot de passe oublié"
- Ajouter validation plus stricte des mots de passe côté UI
- Ajouter messages de succès après inscription
- Ajouter protection contre double soumission plus robuste

Priorité: moyenne

## 2. Dashboard

Fichier: `src/pages/DashboardPage.jsx`

Déjà fait:
- Chargement réel de `me`
- Chargement réel de `myRanking`
- Chargement réel de `myGroups`
- Chargement réel de `myEvents`
- Etats loading / erreur de base

Ce qu'il manque pour finaliser:
- Ajouter un vrai refresh manuel ou automatique des données
- Mieux mapper les données métier réelles sur les cartes visuelles
- Remplacer les textes résumés calculés par de vraies données d'activité si une API existe
- Ajouter un vrai empty state plus travaillé pour les groupes et événements
- Ajouter gestion de retry si la gateway échoue

Blocage actuel:
- Le README backend ne donne pas de requêtes exploitables pour un vrai bloc "planning / séances"

Priorité: faible à moyenne

## 3. Page Community

Fichier: `src/pages/CommunityPage.jsx`

Etat actuel:
- Connectée au backend
- Chargement de mes groupes réel
- Détail du groupe sélectionné réel
- Recherche de groupes réelle
- Création de groupe réelle
- Rejoindre un groupe réel

Ce qu'il manque pour finaliser:
- Remplacer les champs dérivés localement (points/titres) par des données backend réelles si elles existent
- Implémenter l'invitation de membre si une mutation dédiée est disponible
- Ajouter actions avancées de gestion de groupe (leaveGroup, updateGroup, deleteGroup) selon les droits

Point d'attention:
- Le schéma actuel ne fournit pas de score/titre membre dans `group.members`, donc certaines colonnes sont encore calculées côté frontend

Priorité: moyenne

## 4. Page Events

Fichier: `src/pages/EventsPage.jsx`

Etat actuel:
- Connectée au backend
- Chargement événements via `myEvents` + `groupEvents`
- Création d'événement réelle via `createEvent`
- Participation à un événement réelle via `joinEvent`
- Statut open/registered/past calculé dynamiquement

Ce qu'il manque pour finaliser:
- Ajouter désinscription événement si mutation backend disponible
- Ajouter édition/suppression d'événement si besoin métier (updateEvent/deleteEvent)
- Déplacer les champs non supportés nativement (lieu/capacité) vers un modèle backend propre

Point d'attention:
- La mutation createEvent ne prend pas lieu/capacité actuellement; ces infos sont fusionnées dans la description côté frontend

Priorité: moyenne

## 5. Page Challenges

Fichier: `src/pages/ChallengesPage.jsx`

Etat actuel:
- UI complète côté frontend
- Filtres, cartes et modale déjà prêts
- Données réelles chargées via `challenges`
- Participants chargés via `challengeParticipants(challengeId)`
- Etats loading / error affichés

Ce qu'il manque pour finaliser:
- Connecter la création/inscription challenge dès que les mutations existent
- Remplacer les champs dérivés localement restants si le backend expose plus de détail métier
- Ajouter résultats détaillés et actions utilisateur quand les mutations seront disponibles

Blocage actuel:
- Le backend expose la lecture challenge, mais pas encore de mutation challenge dédiée documentée

Priorité: faible à moyenne

## 6. Page Chat

Fichier: `src/pages/ChatPage.jsx`

Etat actuel:
- Connectée au backend
- Conversations alimentées depuis `myGroups`
- Historique réel via `groupMessages(groupId, limit)`
- Envoi réel via `sendMessage(groupId, content)`
- Refresh auto toutes les 8 secondes
- Etats loading / error / empty gérés

Ce qu'il manque pour finaliser:
- Passer d'un polling simple à du temps réel WebSocket si disponible
- Ajouter indicateur de frappe / présence utilisateur si backend le permet
- Ajouter suppression de message si `deleteMessage` doit être exposée en UI

Point d'attention:
- Le temps réel est actuellement simulé via polling; un canal websocket dédié restera préférable

Priorité: moyenne

## 7. Page Planning

Etat actuel:
- Ecran dédié implémenté et routé
- Données réelles via `myWorkoutSessions(limit)`
- Enregistrement d'une séance complétée via `completeWorkoutSession`
- Mapping contextuel des labels événement/groupe via `myEvents` + `myGroups`
- Filtres `Récentes`, `Aujourd'hui`, `Top calories`
- Etats loading / empty / error gérés

Ce qu'il manque pour finaliser:
- Ajouter le cycle complet des séances (création/modification/suppression planifiée) dès que les mutations dédiées existent
- Ajouter un mode planification future (pas uniquement complétion)

Priorité: faible à moyenne

## 8. Page Ranking

Etat actuel:
- Ecran dédié implémenté et routé
- `leaderboard(limit)` connecté
- `myRanking` connecté
- Mise en avant de l'utilisateur connecté dans le tableau
- Etats loading / empty / error gérés

Ce qu'il manque pour finaliser:
- Ajouter pagination backend si le volume devient important
- Ajouter filtres métier si requis (hebdo/mensuel/global)

Priorité: faible

## 9. Page Profile

Etat actuel:
- Ecran dédié implémenté et routé
- Chargement profil réel (`me`)
- Stats réelles connectées (`myRanking`, `myGroups`, `myEvents`)
- Etats loading / empty / error gérés

Ce qu'il manque pour finaliser:
- Ajouter édition de profil si mutation backend disponible
- Ajouter préférences utilisateur si API correspondante existe
- Ajouter upload avatar si l'API media est prévue

Priorité: faible

## 10. Travaux transverses encore manquants

Pour finaliser correctement le frontend, il reste aussi ces chantiers globaux:
- Ajouter des hooks de données par domaine: auth, dashboard, community, events, chat, ranking
- Ajouter des vrais états skeleton UI sur toutes les pages
- Ajouter des toasts de succès explicites sur les actions principales
- Préparer des variables d'environnement `.env` pour les URLs backend
- Ajouter tests minimum sur Auth et Dashboard
- Ajouter gestion de route plus propre si le projet grossit

Déjà réalisé côté transversal:
- Client GraphQL centralisé avec gestion d'erreur standardisée
- Gestion globale `UNAUTHENTICATED` (déconnexion et retour Auth automatiques)
- Toasts globaux unifiés (`ToastViewport`)
- Utilitaire de token partagé (`serviceUtils`) et normalisation des services

## Ordre recommandé pour terminer le projet

Ordre conseillé de finalisation:
1. Challenges (finalisation backend)

Pourquoi cet ordre:
- Profile est simple à brancher sur `me`
- Planning et Challenges nécessitent encore une clarification API

## Dépendances backend à clarifier avant finalisation complète

A confirmer côté backend:
- Mutation création / modification / suppression d'événement
- Mutation participation / désinscription événement
- Mutation envoi de message chat
- Source réelle des challenges
- API planning/workouts utilisable côté frontend
- Mutation invitation membre / rejoindre groupe / quitter groupe
- Mutation mise à jour profil utilisateur

## Définition de done frontend

Une page peut être considérée finalisée si:
- Elle n'utilise plus de données mockées
- Toutes les actions UI appellent le backend réel
- Elle gère loading, empty state et error state
- Les erreurs auth redirigent correctement vers la page de connexion
- Les textes et statuts affichés viennent des vraies données métier
- Les CTA ne sont pas seulement visuels mais réellement fonctionnels
