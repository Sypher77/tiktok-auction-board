# ⚠️ MISE À JOUR IMPORTANTE - HTTP Server

## Changement d'Architecture

Le serveur a été mis à jour pour servir l'application via **HTTP** au lieu de fichiers locaux.

### Pourquoi ce changement ?

TikTok Live Studio et OBS nécessitent l'accès à `http://localhost:8080` et ne peuvent pas charger des fichiers `file:///` via WebSocket.

### Ce qui a changé

**Avant :**
- Serveur WebSocket uniquement
- Ouverture de `index.html` en local (double-clic)
- OBS utilisait `file:///C:/Users/.../index.html`

**Maintenant :**
- Serveur HTTP + WebSocket sur le même port (8080)
- Accès via `http://localhost:8080`
- OBS utilise `http://localhost:8080?obs=true`

---

## 🔧 Installation de la Mise à Jour

### Si vous avez déjà installé l'application :

1. **Installez Express :**
   ```powershell
   cd C:\Users\danie\Desktop\tableau\server
   npm install express
   ```

2. **Redémarrez le serveur :**
   ```powershell
   npm start
   ```

3. **Nouvelle URL :**
   - Navigateur : `http://localhost:8080`
   - OBS : `http://localhost:8080?obs=true`

### Première installation :

Suivez normalement [QUICKSTART.md](QUICKSTART.md) - Express sera installé automatiquement avec `npm install`

---

## ✅ Avantages

1. **Compatible TikTok Live Studio** ✅
   - L'overlay peut être chargé directement dans le logiciel

2. **Compatible OBS** ✅
   - Source navigateur fonctionne parfaitement
   - Pas de problème de CORS ou de sécurité

3. **Plus pratique** ✅
   - Une seule URL : `http://localhost:8080`
   - Pas besoin de chercher les fichiers locaux

4. **Déploiement facile** ✅
   - Peut être hébergé en ligne si besoin
   - Partage possible sur réseau local

---

## 🎯 Nouvelles Instructions

### Pour utiliser l'application :

1. **Démarrez le serveur** (obligatoire maintenant)
   ```powershell
   cd C:\Users\danie\Desktop\tableau\server
   npm start
   ```

2. **Ouvrez dans votre navigateur**
   ```
   http://localhost:8080
   ```

3. **Dans OBS**
   ```
   http://localhost:8080?obs=true
   ```

4. **Dans TikTok Live Studio**
   - Ajoutez une source "Navigateur Web"
   - URL : `http://localhost:8080?obs=true`
   - Dimensions : 1920x1080

---

## ❓ Questions Fréquentes

### Est-ce que demo.html fonctionne encore ?

Oui ! `demo.html` peut toujours être ouvert en double-clic pour voir le design sans démarrer le serveur.

### Est-ce que je dois toujours garder le serveur ouvert ?

Oui, maintenant le serveur est **obligatoire** pour utiliser l'application (pas juste pour TikTok, mais aussi pour charger l'interface).

### Puis-je encore utiliser l'ancienne méthode ?

Non, l'interface principale nécessite maintenant le serveur HTTP pour fonctionner correctement avec WebSocket.

---

## 🐛 Dépannage

### "Impossible de se connecter à localhost:8080"

➡️ Le serveur n'est pas démarré. Lancez `npm start` dans le dossier `server/`

### "npm ERR! Cannot find module 'express'"

➡️ Express n'est pas installé. Exécutez :
```powershell
cd server
npm install express
```

### "Ce site est inaccessible"

➡️ Vérifiez que :
- Le serveur est bien démarré (pas d'erreur dans PowerShell)
- Vous utilisez `http://` et pas `https://`
- Le port 8080 n'est pas utilisé par un autre programme

---

**Date de mise à jour :** 19 décembre 2024

**Version :** 2.0 (HTTP Server)
