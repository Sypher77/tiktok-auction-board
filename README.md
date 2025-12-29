# TikTok Live - Tableau d'Enchères

Application web en temps réel pour afficher un classement des donations TikTok Live pendant les enchères.

## ✨ Fonctionnalités

- 🎯 **Connexion directe à TikTok Live** (via @username, aucune clé API requise)
- ⏱️ **Timer configurable** avec gel automatique à 0:00
- 🏆 **Classement en temps réel** par nombre de pièces
- 🎨 **Design moderne** inspiré de TikTok avec effets glassmorphism
- ✨ **Animations fluides** et highlight du #1
- 🎥 **Compatible OBS Studio** (overlay transparent)
- 💾 **Sauvegarde des préférences**

## 🚀 Installation Rapide

1. **Installer Node.js** : https://nodejs.org/

2. **Installer les dépendances** :
   ```powershell
   cd server
   npm install
   ```

3. **Démarrer le serveur** :
   ```powershell
   npm start
   ```

4. **Ouvrir l'overlay** :
   - Ouvrez http://localhost:8080 dans Chrome/Edge

## 📖 Documentation Complète

Consultez **[GUIDE.md](GUIDE.md)** pour :
- Instructions détaillées d'installation
- Configuration OBS Studio
- Résolution de problèmes
- Personnalisation
- Conseils d'utilisation

## 🎮 Utilisation Rapide

1. Lancez le serveur (`npm start` dans le dossier server)
2. Ouvrez http://localhost:8080 dans votre navigateur
3. Entrez un @username TikTok qui est en live
4. Cliquez sur "Se connecter"
5. Configurez le timer et cliquez sur "Démarrer"
6. Les donations apparaissent automatiquement !

## 🎥 OBS Studio

URL pour source navigateur :
```
http://localhost:8080?obs=true
```

⚠️ **Le serveur doit être démarré pour OBS !**

Dimensions recommandées : 1920x1080

## 🛠️ Technologies

- **Frontend** : HTML5, CSS3 (Glassmorphism), Vanilla JavaScript
- **Backend** : Node.js, WebSocket (ws)
- **TikTok** : tiktok-live-connector
- **Fonts** : Google Fonts (Outfit)

## 📂 Structure

```
tableau/
├── index.html          # Interface principale
├── styles.css          # Design et animations
├── app.js             # Logique de l'application
├── server/
│   ├── package.json   # Dépendances
│   └── server.js      # Serveur WebSocket
├── GUIDE.md           # Documentation complète
└── README.md          # Ce fichier
```

## 🎨 Personnalisation

Éditez `styles.css` pour modifier :
- Couleurs (variables CSS)
- Animations
- Tailles et espacements

## ⚡ Raccourcis Clavier

- `ESPACE` : Démarrer/Pause le timer
- `CTRL + R` : Reset le timer

## 📊 Exemple de Live

1. Trouvez un live TikTok actif (par exemple : @username)
2. Connectez-vous via l'interface
3. Démarrez un timer de 2 minutes
4. Les spectateurs envoient des gifts
5. Le tableau se met à jour en temps réel
6. À 0:00, le gagnant est figé en position #1 ✨

## 🐛 Problèmes Courants

**Le serveur ne démarre pas**
- Vérifiez que Node.js est installé : `node --version`

**Impossible de se connecter au live**
- Vérifiez que l'utilisateur est bien EN DIRECT
- Vérifiez l'orthographe du username

**Aucune donation n'apparaît**
- Vérifiez que le timer est démarré
- Attendez qu'un spectateur envoie un gift

Plus de détails → [GUIDE.md](GUIDE.md)

## 📝 License

MIT

## 👤 Auteur

Créé pour les streamers TikTok 🎮✨

---

**Bon stream ! 🚀**
