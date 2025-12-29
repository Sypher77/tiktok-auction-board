# FAQ - Questions Fréquentes

## 🔧 Installation & Configuration

### Q: Est-ce que j'ai besoin d'une clé API TikTok ?
**R:** Non ! TikTok-Live-Connector se connecte directement au live en utilisant uniquement le @username. Aucune inscription ni clé API n'est nécessaire.

### Q: Dois-je installer quelque chose ?
**R:** Oui, vous avez besoin de :
- **Node.js** (téléchargeable gratuitement sur nodejs.org)
- Les packages npm (installation automatique avec `npm install`)

### Q: Ça fonctionne sur Mac/Linux ?
**R:** Oui ! Le projet est compatible Windows, Mac et Linux. Sur Mac/Linux, utilisez Terminal au lieu de PowerShell.

### Q: Puis-je modifier les couleurs et le design ?
**R:** Absolument ! Éditez le fichier `styles.css` et modifiez les variables CSS en haut du fichier.

---

## 🎮 Utilisation

### Q: Comment savoir si je suis connecté à TikTok ?
**R:** Le statut en haut du panneau de contrôle affiche :
- 🔴 Rouge = Déconnecté
- 🟠 Orange = Connexion en cours
- 🟢 Vert = Connecté au live

De plus, la console PowerShell affiche "✅ Successfully connected to @username's live stream"

### Q: Pourquoi aucune donation n'apparaît ?
**R:** Plusieurs raisons possibles :
1. Le timer n'est pas démarré
2. Le timer est gelé (à 0:00)  
3. Aucun spectateur n'a encore envoyé de gift
4. Problème de connexion au live

Vérifiez la console PowerShell pour voir si des gifts sont reçus.

### Q: Quels types de gifts sont comptés ?
**R:** Tous les gifts TikTok sont comptés ! Chaque gift a une valeur en pièces qui s'accumule automatiquement par utilisateur.

Exemples :
- Rose 🌹 = 1 pièce
- Cœur ❤️ = 5 pièces  
- Lion 🦁 = 100 pièces
- Etc.

### Q: Est-ce que les "likes" sont comptés ?
**R:** Non, seuls les **gifts** (donations payantes) sont comptés dans le classement.

### Q: Le timer peut-il durer plus de 5 minutes ?
**R:** Oui ! Utilisez le champ "Custom" pour définir n'importe quelle durée en secondes.

Exemple : 600 secondes = 10 minutes

---

## 🎥 OBS & Streaming

### Q: Comment rendre l'arrière-plan transparent dans OBS ?
**R:** Deux méthodes :

**Méthode 1 (Recommandée)** : Utilisez l'URL avec `?obs=true`
```
file:///C:/Users/danie/Desktop/tableau/index.html?obs=true
```

**Méthode 2** : Ajoutez un filtre Chroma Key sur la source navigateur

### Q: Quelle taille dois-je utiliser pour OBS ?
**R:** 
- **Full HD** : 1920x1080 (recommandé)
- **HD** : 1280x720
- **Custom** : Ajustez selon vos besoins

L'interface est responsive et s'adapte automatiquement.

### Q: Le panneau de contrôle apparaît dans OBS !
**R:** Assurez-vous d'utiliser `?obs=true` dans l'URL, ou cliquez sur le bouton "👁️ OBS" dans l'interface.

### Q: L'overlay lag dans OBS
**R:** 
- Fermez d'autres onglets du navigateur
- Réduisez le nombre de positions affichées (5 au lieu de 20)
- Vérifiez que votre PC a assez de ressources

---

## 🔌 Connexion & Serveur

### Q: "Erreur de connexion. Vérifiez que le serveur est démarré"
**R:** Le serveur Node.js n'est pas lancé. Ouvrez PowerShell et exécutez :
```powershell
cd C:\Users\danie\Desktop\tableau\server
npm start
```

Gardez cette fenêtre ouverte pendant tout le live !

### Q: "Impossible de trouver le live"
**R:** Vérifiez que :
1. L'utilisateur est **actuellement en live** (pas une vidéo, pas hors ligne)
2. Le username est correct (sans le @)
3. Le live est public (pas privé)

### Q: Le serveur se déconnecte tout seul
**R:** Cela peut arriver si :
- Le live TikTok se termine
- Problème de connexion internet
- TikTok bloque temporairement (rare)

Solution : Reconnectez-vous simplement.

### Q: Puis-je me connecter à plusieurs lives en même temps ?
**R:** Non, vous ne pouvez être connecté qu'à un seul live à la fois. Pour changer de live, déconnectez-vous et reconnectez-vous au nouveau username.

---

## 🏆 Classement & Donations

### Q: Comment sont classés les utilisateurs ?
**R:** Par ordre décroissant de **pièces totales**. Celui qui a donné le plus de pièces est #1.

### Q: Si deux personnes ont le même nombre de pièces ?
**R:** L'ordre est déterminé par qui a atteint ce score en premier.

### Q: Que se passe-t-il quand le timer arrive à 0 ?
**R:** 
1. Le timer s'arrête automatiquement
2. Le classement se **gèle** ❄️
3. Plus aucune mise à jour n'est possible
4. Le timer devient rouge pour indiquer le gel
5. Vous devez cliquer sur "Reset" pour recommencer

### Q: Puis-je voir plus de 5 positions ?
**R:** Oui ! Modifiez le champ "Positions affichées" dans le panneau de contrôle. Vous pouvez afficher jusqu'à 20 positions.

### Q: Les donations avant la connexion sont-elles comptées ?
**R:** Non, seules les donations **après** la connexion au live sont comptabilisées.

---

## 🎨 Personnalisation Avancée

### Q: Comment changer la police ?
**R:** Éditez `index.html` et modifiez la ligne Google Fonts :
```html
<link href="https://fonts.googleapis.com/css2?family=VotrePolice:wght@400;600;700;800&display=swap" rel="stylesheet">
```

Puis dans `styles.css`, modifiez :
```css
font-family: 'VotrePolice', sans-serif;
```

### Q: Comment changer le port du serveur ?
**R:** Éditez `server/server.js` :
```javascript
const PORT = process.env.PORT || 8081; // Changez 8080 en 8081
```

Et `app.js` :
```javascript
wsUrl: 'ws://localhost:8081' // Gardez le même port
```

### Q: Puis-je ajouter mon logo ?
**R:** Oui ! Éditez `index.html` et remplacez la section `footer-brand` :
```html
<div class="footer-brand">
    <img src="votre-logo.png" alt="Logo" style="height: 50px;">
</div>
```

### Q: Comment retirer les médailles 🥇🥈🥉 ?
**R:** Dans `styles.css`, supprimez ou commentez :
```css
.rank-badge.rank-1::before { content: '🥇'; ... }
.rank-badge.rank-2::before { content: '🥈'; ... }
.rank-badge.rank-3::before { content: '🥉'; ... }
```

---

## ⚠️ Problèmes Connus

### Q: Le serveur plante avec "EADDRINUSE"
**R:** Le port 8080 est déjà utilisé par un autre programme.

Solution : Changez le port (voir question précédente sur le changement de port)

### Q: Les avatars ne s'affichent pas
**R:** Les avatars utilisent l'API de TikTok qui peut être bloquée dans certaines régions.

Solution : Des avatars par défaut générés automatiquement prendront le relais.

### Q: "npm : Impossible de charger le fichier..."
**R:** Problème de politique d'exécution PowerShell.

Solution : Consultez **INSTALLATION.md** pour autoriser les scripts.

---

## 📱 Compatibilité

### Q: Puis-je l'utiliser avec d'autres plateformes que TikTok ?
**R:** Non, cette version est spécifiquement conçue pour TikTok Live. Pour d'autres plateformes (Twitch, YouTube), il faudrait adapter le code.

### Q: Ça fonctionne sur mobile ?
**R:** L'overlay web fonctionne sur mobile, mais vous avez besoin d'un ordinateur pour :
- Faire tourner le serveur Node.js
- Utiliser OBS Studio

### Q: Puis-je l'héberger en ligne ?
**R:** Techniquement oui, mais :
- Le serveur Node.js doit être hébergé (Heroku, DigitalOcean, etc.)
- L'URL WebSocket doit être adaptée (wss:// au lieu de ws://)
- Complexité accrue, recommandé pour utilisateurs avancés uniquement

---

## 💡 Astuces & Conseils

### Astuce 1 : Test avant le live
Utilisez `demo.html` pour tester l'apparence de l'overlay dans OBS **avant** votre live.

### Astuce 2 : Raccourcis clavier
- `ESPACE` : Démarrer/Pause rapide
- `CTRL + R` : Reset rapide

### Astuce 3 : Backup
Gardez PowerShell ouvert et surveillez les logs pour diagnostiquer rapidement tout problème.

### Astuce 4 : Multiple rounds
Pour des enchères en plusieurs manches, utilisez "Reset" entre chaque manche. Vous pouvez choisir de garder ou effacer le classement.

### Astuce 5 : Performance
Si vous streamez en 1080p avec beaucoup d'effets, limitez à 10 positions affichées maximum pour de meilleures performances.

---

## 🆘 Besoin d'aide ?

Si votre problème n'est pas listé ici :

1. Vérifiez les logs PowerShell (serveur)
2. Vérifiez la console JavaScript (F12 dans le navigateur)
3. Consultez **GUIDE.md** pour plus de détails
4. Redémarrez serveur + navigateur

---

**Bonne chance avec vos lives TikTok ! 🎉**
