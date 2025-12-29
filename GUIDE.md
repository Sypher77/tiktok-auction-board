# Guide d'Installation et d'Utilisation
## Tableau d'Enchères TikTok Live

Ce guide vous explique comment installer et utiliser le tableau d'enchères pour vos lives TikTok.

---

## 📋 Prérequis

- **Node.js** (version 14 ou supérieure)
  - Téléchargez depuis : https://nodejs.org/
  - Vérifiez l'installation : ouvrez PowerShell et tapez `node --version`

- **Un navigateur moderne** (Chrome, Edge, ou Firefox)

- **OBS Studio** (pour l'overlay)
  - Téléchargez depuis : https://obsproject.com/

---

## 🚀 Installation

### Étape 1 : Installer les dépendances du serveur

1. Ouvrez **PowerShell** ou **Terminal**

2. Naviguez vers le dossier server :
   ```powershell
   cd C:\Users\danie\Desktop\tableau\server
   ```

3. Installez les packages Node.js :
   ```powershell
   npm install
   ```

   Cela va installer :
   - `tiktok-live-connector` : pour se connecter à TikTok Live
   - `ws` : pour le serveur WebSocket

---

## ▶️ Utilisation

### Étape 1 : Démarrer le serveur

Dans PowerShell, depuis le dossier `server` :

```powershell
npm start
```

Vous devriez voir :
```
🚀 WebSocket server running on ws://localhost:8080
📱 Waiting for overlay to connect...
```

⚠️ **Important** : Gardez cette fenêtre PowerShell ouverte pendant tout le live !

---

### Étape 2 : Ouvrir l'overlay

1. Ouvrez **Google Chrome** ou **Edge**

2. Naviguez vers le fichier :
   ```
   C:\Users\danie\Desktop\tableau\index.html
   ```
   
   Ou double-cliquez sur `index.html`

3. Vous devriez voir l'interface de configuration sur la gauche

---

### Étape 3 : Connecter à un live TikTok

1. Dans l'interface, entrez le **@username** d'un utilisateur TikTok qui est EN DIRECT

   Exemple : Si le live est `tiktok.com/@monuser/live`, entrez `monuser`

2. Cliquez sur **"Se connecter"**

3. Le statut devrait passer à **"Connecté au live"** 🟢

---

### Étape 4 : Configurer le timer

1. Choisissez une durée :
   - **Présets** : 10s, 30s, 1min, 5min
   - **Custom** : Entrez un nombre de secondes personnalisé

2. Cliquez sur **"▶️ Démarrer"** pour lancer le compte à rebours

---

### Étape 5 : Pendant le live

- Les donations (gifts) apparaîtront **automatiquement** dans le classement
- Le classement se met à jour **en temps réel**
- Quand le timer atteint **0:00**, le tableau se **gèle** ❄️
- La position #1 a un **effet doré brillant** ✨

**Contrôles :**
- ▶️ **Démarrer** : Lance le timer
- ⏸️ **Pause** : Met le timer en pause
- 🔄 **Reset** : Réinitialise le timer (et optionnellement le classement)

**Raccourcis clavier :**
- `ESPACE` : Démarrer/Pause
- `CTRL + R` : Reset

---

## 🎥 Configuration OBS Studio

### Ajouter l'overlay dans OBS

1. Ouvrez **OBS Studio**

2. Dans la section **Sources**, cliquez sur **+** → **Navigateur**

3. Configurez :
   - **Nom** : "TikTok Auction Board"
   - **URL** :
     ```
     file:///C:/Users/danie/Desktop/tableau/index.html?obs=true
     ```
   - **Largeur** : 1920
   - **Hauteur** : 1080
   - ✅ Cochez **"Arrêter la lecture lorsque non visible"**

4. Cliquez **OK**

### Masquer le panneau de contrôle

L'URL avec `?obs=true` masque automatiquement le panneau de contrôle.

**Alternative** : Dans l'overlay, cliquez sur le bouton **👁️ OBS** en haut à droite.

### Transparence

Si vous voulez un fond transparent :

1. Clic droit sur la source → **Filtres**
2. Ajoutez **"Suppression couleur (Chroma Key)"**
3. Type de clé : **Couleur personnalisée**
4. Couleur : Sélectionnez le fond violet/noir
5. Ajustez la **similarité** et le **lissage**

---

## 🎨 Personnalisation

### Changer les couleurs

Éditez `styles.css` et modifiez les variables CSS :

```css
:root {
    --accent-cyan: #00ffcc;      /* Couleur du timer */
    --accent-gold: #ffd700;      /* Couleur dorée */
    --border-gold: #d4af37;      /* Bordures */
}
```

### Nombre de positions affichées

Dans l'interface, modifiez **"Positions affichées"** (par défaut : 5)

Vous pouvez afficher de 3 à 20 positions.

---

## 🔧 Résolution de problèmes

### Le serveur ne démarre pas

**Erreur** : `'node' n'est pas reconnu...`

**Solution** : Installez Node.js depuis https://nodejs.org/

---

### Impossible de se connecter au live TikTok

**Erreurs possibles :**

1. **"Impossible de trouver le live"**
   - Vérifiez que l'utilisateur est **bien en live actuellement**
   - Vérifiez l'orthographe du username (sans @)

2. **"Le live est terminé"**
   - Le live a pris fin, choisissez un autre live actif

3. **Erreur de connexion**
   - Redémarrez le serveur (`CTRL+C` puis `npm start`)
   - Vérifiez votre connexion Internet

---

### Aucune donation n'apparaît

1. Vérifiez que le timer est **démarré** (pas gelé)
2. Vérifiez dans la console PowerShell que des events sont reçus
3. Attendez qu'un spectateur envoie un gift dans le live

---

### L'overlay ne se connecte pas au serveur

1. Vérifiez que le **serveur est démarré** (PowerShell ouvert)
2. Vérifiez l'URL du serveur dans `app.js` :
   ```javascript
   wsUrl: 'ws://localhost:8080'
   ```
3. Rechargez la page de l'overlay

---

## 📊 Comprendre les gifts TikTok

### Valeur en pièces

Chaque gift TikTok a une valeur en **diamants** qui est convertie en **pièces**.

Exemples de gifts populaires :
- 🌹 Rose : 1 pièce
- ❤️ Cœur : 5 pièces
- 🎁 Cadeau : 10 pièces
- 🦁 Lion : 100 pièces
- 👑 Couronne : 500 pièces

Le serveur **cumule automatiquement** les pièces par utilisateur.

### Repeat Count

Si un utilisateur envoie le même gift plusieurs fois d'affilée (combo), le serveur compte toutes les répétitions.

Exemple : Rose x50 = 50 pièces

---

## 💡 Conseils d'utilisation

### Pour un live d'enchères

1. **Avant le live** :
   - Lancez le serveur
   - Ouvrez l'overlay
   - Configurez le timer (ex: 2-5 minutes)
   - Ajoutez la source dans OBS

2. **Pendant le live** :
   - Connectez-vous à votre live TikTok
   - Annoncez le début des enchères
   - Démarrez le timer
   - Les spectateurs envoient des gifts

3. **Fin des enchères** :
   - Le timer arrive à 0:00
   - Le tableau se gèle automatiquement
   - Le gagnant est en position #1 avec effet doré ✨
   - Annoncez le gagnant !

4. **Nouvelle manche** :
   - Cliquez sur **Reset**
   - Confirmez l'effacement du classement
   - Relancez le timer

### Options utiles

- ✅ **Démarrage auto** : Le timer démarre automatiquement à la connexion
- **Positions affichées** : Affichez plus de gagnants (top 10, top 20)

---

## 🛠️ Architecture technique

```
┌─────────────────┐
│  TikTok Live    │
│   (@username)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  Server Node.js     │
│  (server.js)        │
│  - TikTok Connector │
│  - WebSocket Server │
└────────┬────────────┘
         │ ws://localhost:8080
         ▼
┌─────────────────────┐
│  Overlay Browser    │
│  (index.html)       │
│  - Timer            │
│  - Leaderboard      │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   OBS Studio        │
│   Browser Source    │
└─────────────────────┘
```

---

## 📝 Notes importantes

### Limitations de TikTok-Live-Connector

- **Pas d'API officielle** : TikTok-Live-Connector utilise le web scraping
- **Peut casser** : Les mises à jour de TikTok peuvent nécessiter une mise à jour du package
- **Rate limiting** : Ne vous connectez pas trop souvent au même live

### Mises à jour

Pour mettre à jour les packages :

```powershell
cd server
npm update
```

---

## 🆘 Support

### Logs du serveur

Le serveur affiche toutes les informations importantes dans PowerShell :
- ✅ Connexion réussie
- 🎁 Gifts reçus (user, gift name, coins)
- 📊 Statistiques toutes les 30 secondes

### Console du navigateur

Ouvrez les DevTools (`F12`) pour voir les logs de l'overlay :
- Connexion WebSocket
- Messages reçus
- Erreurs éventuelles

---

## 📦 Fichiers du projet

```
tableau/
├── index.html          # Interface principale
├── styles.css          # Design et animations
├── app.js             # Logique de l'overlay
├── server/
│   ├── package.json   # Dépendances Node.js
│   └── server.js      # Serveur WebSocket + TikTok
└── GUIDE.md           # Ce fichier
```

---

## 🎉 Profitez de vos lives !

Vous êtes maintenant prêt à utiliser le tableau d'enchères pour vos lives TikTok !

**Bon stream ! 🚀📱✨**
