# 🚀 Guide de Démarrage Rapide

## Synchronisation Temps Réel - TikTok Live Auction Board

### ✅ Ce qui a été implémenté

Votre application dispose maintenant d'une **synchronisation temps réel parfaite** entre tous les écrans :
- 🖥️ Overlay principal (OBS / TikTok Live Studio)
- 📱 Panel d'administration mobile
- 🌐 Tous les navigateurs connectés

### 📋 Fichiers Modifiés

1. **[server/server.js](file:///c:/Users/danie/Desktop/tableau/server/server.js)** - Serveur WebSocket avec état global
2. **[app.js](file:///c:/Users/danie/Desktop/tableau/app.js)** - Client refactorisé (WebSocket only)
3. **[admin.html](file:///c:/Users/danie/Desktop/tableau/admin.html)** - ✨ NOUVEAU : Interface admin mobile

---

## 🎮 Comment Utiliser

### 1️⃣ Démarrer le Serveur

```bash
cd server
node server.js
```

Le serveur démarrera sur le port **8080** (ou celui défini par Render).

### 2️⃣ Ouvrir les Interfaces

**Overlay Principal :**
```
http://localhost:8080/index.html
```
📺 Pour OBS : ajoutez `?obs=true` pour masquer les contrôles

**Admin Mobile :**
```
http://localhost:8080/admin.html
```
📱 Interface simplifiée pour contrôler le timer depuis un téléphone

### 3️⃣ Tester la Synchronisation

1. Ouvrez `index.html` dans un onglet
2. Ouvrez `admin.html` dans un autre onglet (ou sur mobile)
3. Cliquez sur "1min" dans admin
4. ✨ Le timer change **instantanément** sur tous les écrans

---

## 🎯 Fonctionnalités

### Timer Synchronisé
- ⏱️ Tourne côté serveur (aucun décalage)
- 🔄 Mise à jour toutes les secondes sur TOUS les clients
- ⏸️ Start / Pause / Reset synchronisés
- ❄️ Freeze automatique à 0:00

### Admin Panel
- 🔘 Presets rapides (10s, 30s, 1min, 5min)
- ⌨️ Durée personnalisée en minutes
- 🎛️ Contrôles : Start, Pause, Reset, Clear leaderboard

### Leaderboard
- 🏆 Mise à jour instantanée sur tous les écrans
- 🎁 Gifts TikTok synchronisés en temps réel
- 👥 Ranking calculé côté serveur

---

## 🔧 Messages WebSocket

### Client → Serveur

| Message | Description | Payload |
|---------|-------------|---------|
| `timer:start` | Démarre le timer | - |
| `timer:pause` | Pause le timer | - |
| `timer:reset` | Reset le timer | - |
| `timer:setDuration` | Change la durée | `{ seconds: 120 }` |
| `leaderboard:clear` | Efface le classement | - |

### Serveur → Client

| Message | Description | Quand |
|---------|-------------|-------|
| `state:init` | État complet | À la connexion |
| `timer:update` | État du timer | Toutes les 1s (si running) |
| `leaderboard:update` | Classement | Après chaque gift |

---

## 🌐 Déploiement Render

### Configuration Automatique

Le code détecte automatiquement si vous êtes sur :
- **Local** : utilise `ws://localhost:8080`
- **Render** : utilise `wss://your-app.onrender.com`

### Commande de Build (Render)

Aucune commande de build nécessaire.

**Start Command :**
```
cd server && node server.js
```

---

## ✅ Tests Effectués

- ✅ Synchronisation multi-onglets
- ✅ Timer synchronisé à la seconde près
- ✅ Nouveaux clients reçoivent l'état immédiatement
- ✅ Reconnexion automatique
- ✅ Leaderboard temps réel

---

## 📞 Utilisation Typique

### Scénario : TikTok Live

1. **Avant le live :**
   - Démarrer le serveur
   - Ouvrir `index.html?obs=true` dans OBS
   - Ouvrir `admin.html` sur votre téléphone

2. **Pendant le live :**
   - Depuis le téléphone : régler le timer (ex: 5min)
   - Cliquer "Start" sur le mobile
   - L'overlay OBS affiche le timer en temps réel
   - Les viewers voient le décompte en direct

3. **Quand un viewer envoie un gift :**
   - Le serveur reçoit l'info (via TikTok-Live-Connector)
   - Le classement se met à jour automatiquement
   - Tous les écrans voient le changement instantanément

4. **À la fin du timer :**
   - Le timer se freeze à 0:00
   - Le classement est figé
   - Les viewers voient le classement final

---

## 🎨 Personnalisation

### Changer la Durée par Défaut

Dans `server/server.js` :
```javascript
const globalState = {
    timerRemaining: 300,  // 5 minutes au lieu de 60s
    timerTotal: 300,
    // ...
};
```

### Ajouter des Presets

Dans `admin.html` :
```html
<button class="preset-btn" data-seconds="600">10min</button>
```

---

## 🐛 Dépannage

### Le timer ne se synchronise pas
- Vérifier que le serveur tourne
- Ouvrir la console du navigateur → chercher "WebSocket connected"
- Vérifier qu'aucun firewall ne bloque le port 8080

### Les clients ne reçoivent pas les updates
- Vérifier les logs du serveur pour voir les broadcasts
- Rafraîchir la page (reconnexion automatique)

### Admin.html ne se connecte pas sur mobile
- Utiliser l'IP locale du serveur : `http://192.168.x.x:8080/admin.html`
- Vérifier que le mobile est sur le même réseau WiFi

---

## 📚 Documentation Complète

Pour plus de détails sur l'implémentation :
- [Walkthrough complet](file:///C:/Users/danie/.gemini/antigravity/brain/8d762925-22f9-4e10-be22-5d2e08cee54f/walkthrough.md)
- [Plan d'implémentation](file:///C:/Users/danie/.gemini/antigravity/brain/8d762925-22f9-4e10-be22-5d2e08cee54f/implementation_plan.md)

---

**✨ Profitez de votre application parfaitement synchronisée !**
