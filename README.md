# 📚 BiblioThèque - Documentation Utilisateur

Bienvenue dans **BiblioThèque**, une application complète de gestion de bibliothèque qui vous permet d'emprunter des livres, de consulter votre historique d'emprunts et d'accéder à des statistiques détaillées.

---

## 📖 Table des matières

1. [Introduction](#introduction)
2. [Accès à l'application](#accès-à-lapplication)
3. [Authentification](#authentification)
4. [Guide Utilisateur Standard](#guide-utilisateur-standard)
5. [Guide Administrateur](#guide-administrateur)
6. [Comptes de Test](#comptes-de-test)
7. [FAQ](#faq)

---

## Introduction

BiblioThèque est une plateforme de gestion de bibliothèque moderne qui permet à:
- **Les Utilisateurs**: Parcourir le catalogue, emprunter et retourner des livres, consulter leurs emprunts
- **Les Administrateurs**: Gérer le catalogue (ajouter, modifier, supprimer des livres) et consulter des statistiques détaillées

### Caractéristiques principales:
✅ Catalogue complet de livres  
✅ Système d'emprunt simple et intuitif  
✅ Historique personnel des emprunts  
✅ Gestion administrative complète  
✅ Statistiques détaillées sur l'utilisation  
✅ Interface responsive (mobile, tablette, desktop)  

---

## 🛠️ Guide Technique (Développement)

### Prérequis
- **Node.js** (Version 18 ou supérieure recommandée)
- **npm** or **bun**

### Installation

1. Accédez au répertoire du frontend:
   ```bash
   cd library
   ```

2. Installez les dépendances:
   ```bash
   npm install
   ```pour

### Configuration

Créez un fichier `.env` à la racine du dossier `library/` et configurez l'URL de l'API:

```env
VITE_API_URL=http://localhost:3000
```

*Note: Par défaut, si cette variable n'est pas définie, l'application tentera de se connecter à `http://localhost:3000`.*

### Lancement

Pour démarrer le serveur de développement:
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:8080](http://localhost:8080) (ou le port configuré dans `vite.config.ts`).

### Build (Production)

Pour générer les fichiers de production:
```bash
npm run build
```

Les fichiers seront générés dans le dossier `dist/`.

---

## Accès à l'application

Pour accéder à BiblioThèque, naviguez vers: `http://localhost:8080`

L'application vous demandera de vous connecter ou créer un compte.

---

## Authentification

### Se connecter

1. Depuis la page d'accueil, cliquez sur l'onglet **"Connexion"**
2. Entrez votre **nom d'utilisateur** et **mot de passe**
3. Cliquez sur **"Se connecter"**

Vous serez automatiquement redirigé vers:
- **Catalogue** si vous êtes un utilisateur standard (USER)
- **Gestion des Livres** si vous êtes administrateur (ADMIN)

### Créer un compte

1. Depuis la page d'accueil, cliquez sur l'onglet **"Inscription"**
2. Remplissez les champs:
   - **Nom d'utilisateur**: Identifiant unique (obligatoire)
   - **Email**: Votre adresse email (obligatoire)
   - **Mot de passe**: Minimum 6 caractères (obligatoire)
3. Cliquez sur **"S'inscrire"**

Une fois inscrit, vous disposez automatiquement du rôle **USER** et accédez au catalogue.

### Se déconnecter

Pour vous déconnecter, cliquez sur l'icône **Déconnexion** (flèche) en haut à droite de l'écran.

---

## Guide Utilisateur Standard

### 1. Parcourir le Catalogue

**Navigation**: Cliquez sur **"Catalogue"** dans le menu en haut

Vous verrez la liste complète des livres disponibles dans la bibliothèque avec:
- **Titre du livre**
- **Auteur**
- **ISBN**
- **Stock disponible**

### 2. Emprunter un Livre

1. Accédez au **Catalogue**
2. Trouvez le livre que vous désirez
3. Cliquez sur le bouton **"Emprunter"**
4. Un message de confirmation apparaît

✅ Le livre est maintenant dans vos emprunts!

**Note**: Vous pouvez seulement emprunter un livre s'il y a du stock disponible.

### 3. Consulter Mes Emprunts

**Navigation**: Cliquez sur **"Mes Emprunts"** dans le menu en haut

Vous verrez:
- **Liste de vos emprunts actuels**
- **Date d'emprunt** pour chaque livre
- **Bouton "Retourner"** pour rendre les livres

### 4. Retourner un Livre

1. Accédez à **"Mes Emprunts"**
2. Trouvez le livre à retourner
3. Cliquez sur le bouton **"Retourner"**
4. Une confirmation apparaît

✅ Le livre est retourné! Il est maintenant disponible pour d'autres utilisateurs.

---

## Guide Administrateur

Les administrateurs ont accès à deux sections principales:

### 1. Gérer les Livres

**Navigation**: Cliquez sur **"Gérer les Livres"** dans le menu en haut

#### Ajouter un nouveau livre

1. Cliquez sur le bouton **"+ Ajouter"**
2. Remplissez les informations:
   - **Titre**: Titre du livre
   - **Auteur**: Nom de l'auteur
   - **ISBN**: Code ISBN unique
   - **Stock**: Nombre de copies disponibles
3. Cliquez sur **"Enregistrer"**

✅ Le livre est ajouté au catalogue!

#### Modifier un livre existant

1. Dans la table des livres, cliquez sur l'icône **Crayon** (✏️)
2. Modifiez les informations souhaitées
3. Cliquez sur **"Enregistrer"**

✅ Les modifications sont sauvegardées!

#### Supprimer un livre

1. Dans la table des livres, cliquez sur l'icône **Poubelle** (🗑️)
2. Confirmez la suppression

⚠️ **Attention**: Cette action est irréversible!

### 2. Consulter les Statistiques

**Navigation**: Cliquez sur **"Statistiques"** dans le menu en haut

Les statistiques affichent:

#### Cartes de résumé
- **Total Livres**: Nombre de livres disponibles dans la bibliothèque
- **Total Utilisateurs**: Nombre d'utilisateurs inscrits (excluant les admins)
- **Emprunts Totaux**: Nombre total d'emprunts réalisés
- **Livres Populaires**: Nombre de livres avec au moins 1 emprunt

#### Graphique "Top Livres Empruntés"
Affiche les 10 livres les plus empruntés avec:
- Titre du livre
- Nombre d'emprunts
- **Highlight**: Le livre le plus emprunté en surbrillance

Permet d'identifier rapidement les titres populaires.

#### Graphique "Top Utilisateurs Actifs"
Affiche les 10 utilisateurs les plus actifs (rôle USER uniquement) avec:
- Nom d'utilisateur
- Nombre d'emprunts
- **Highlight**: L'utilisateur le plus actif en surbrillance

Permet d'identifier les utilisateurs les plus engagés.

---

## Comptes de Test

Vous pouvez utiliser les comptes suivants pour tester l'application:

### Compte Administrateur
```
Nom d'utilisateur: admin
Mot de passe: admin1234
Rôle: ADMIN
```

### Comptes Utilisateur Standard
```
Compte 1:
Nom d'utilisateur: alice
Mot de passe: alice1234
Rôle: USER

Compte 2:
Nom d'utilisateur: bob
Mot de passe: bob1234
Rôle: USER
```

---

## FAQ

### Q: Puis-je emprunter plusieurs copies du même livre?
**R**: Oui, vous pouvez emprunter autant de copies que vous le souhaitez, tant qu'il y a du stock disponible.

### Q: Combien de temps puis-je garder un livre?
**R**: Il n'y a pas de limite de durée d'emprunt. Vous pouvez retourner le livre à tout moment.

### Q: Que se passe-t-il si j'oublie un livre?
**R**: Retournez-le dès que possible via la page "Mes Emprunts" en cliquant sur "Retourner".

### Q: Comment puis-je devenir administrateur?
**R**: Vous devez être configuré manuellement comme administrateur par le gestionnaire de la base de données. Contactez le support pour demander un accès admin.

### Q: Un administrateur peut-il emprunter des livres?
**R**: Oui, les administrateurs peuvent aussi emprunter et retourner des livres. Cependant, ils ne seront pas comptabilisés dans les statistiques "Top Utilisateurs".

### Q: Que faire si je rencontre une erreur?
**R**: 
1. Vérifiez votre connexion Internet
2. Rafraîchissez la page (F5)
3. Déconnectez-vous et reconnectez-vous
4. Contactez le support si le problème persiste

### Q: Les données sont-elles sécurisées?
**R**: Oui, l'application utilise:
- L'authentification JWT pour les sessions
- Le hachage bcrypt pour les mots de passe
- HTTPS pour la transmission des données

### Q: Puis-je modifier mon profil?
**R**: Actuellement, la modification du profil utilisateur n'est pas disponible. Contactez un administrateur pour modifier vos informations.

---

## Support

Pour toute question ou problème, veuillez contacter le support technique de BiblioThèque.

**Dernière mise à jour**: 2026
**Version**: 1.0.0

---

*BiblioThèque - Votre plateforme de gestion de bibliothèque moderne* 📚
