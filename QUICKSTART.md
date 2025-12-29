# 🚀 DÉMARRAGE RAPIDE - 5 MINUTES

## Étape 1️⃣ : Installer Node.js (si pas déjà fait)

Téléchargez et installez : **https://nodejs.org/**

Vérifiez l'installation :
```powershell
node --version
```

---

## Étape 2️⃣ : Installer les dépendances

Ouvrez PowerShell et exécutez :

```powershell
cd C:\Users\danie\Desktop\tableau\server
npm install
```

Attendez quelques secondes que l'installation se termine.

---

## Étape 3️⃣ : Démarrer le serveur

**Option A - Double-clic :**
```
C:\Users\danie\Desktop\tableau\START_SERVER.bat
```

**Option B - PowerShell :**
```powershell
cd C:\Users\danie\Desktop\tableau\server
npm start
```

✅ **Gardez cette fenêtre ouverte !**

Le serveur affiche :
```
🚀 Server running on http://localhost:8080
📡 WebSocket available on ws://localhost:8080
```

---

## Étape 4️⃣ : Ouvrir l'interface

**Dans votre navigateur, allez sur :**
```
http://localhost:8080
```

Ou cliquez directement : [http://localhost:8080](http://localhost:8080)

✅ Vous voyez maintenant l'interface complète avec le panneau de contrôle !

💡 **Astuce** : Pour voir juste le design, ouvrez `demo.html` directement (double-clic)

---

## Étape 5️⃣ : Se connecter à un live TikTok

### Trouver un live TikTok actif

1. Allez sur TikTok (web ou app)
2. Trouvez un utilisateur EN DIRECT (pas une vidéo !)
3. Notez son @username

**Exemples de lives populaires :**
- Cherchez "LIVE" dans la recherche TikTok
- Regardez la section "LIVE" sur la page d'accueil

### Se connecter

Dans l'interface :

1. **Entrez le @username** (sans le @)
   - Exemple : Si le live est `tiktok.com/@monuser/live`
   - Tapez juste : `monuser`

2. **Cliquez sur "Se connecter"**

3. **Vérifiez le statut** :
   - 🟢 Vert = Connecté ✅
   - 🔴 Rouge = Échec ❌

---

## Étape 6️⃣ : Lancer les enchères !

1. **Choisissez une durée** :
   - Cliquez sur un preset (10s, 30s, 1min, 5min)
   - OU entrez une durée custom

2. **Cliquez sur "▶️ Démarrer"**

3. **Observez** :
   - Le timer compte à rebours
   - Les donations apparaissent automatiquement !

4. **À 0:00** :
   - Le tableau se gèle ❄️
   - Le gagnant est en #1 avec effet doré ✨

---

## 🎥 Pour OBS Studio

1. Ouvrez **OBS**

2. **Sources** → **+** → **Navigateur**

3. **Configurez** :
   - URL : `http://localhost:8080?obs=true`
   - Largeur : **1920**
   - Hauteur : **1080**

4. **Cliquez OK**

⚠️ **Important** : Le serveur doit être démarré pour que OBS puisse charger l'overlay !

L'overlay apparaît sans le panneau de contrôle !

---

## ❓ Problèmes ?

### "Impossible de trouver le live"
➡️ Vérifiez que l'utilisateur est **bien en live MAINTENANT**

### "Erreur de connexion"
➡️ Vérifiez que le **serveur est démarré** (étape 4)

### "npm n'est pas reconnu"
➡️ **Installez Node.js** (étape 1)

### Le timer est bloqué à 0:00
➡️ Cliquez sur **🔄 Reset** pour recommencer

---

## 📚 Plus d'infos ?

- **Guide complet** : `GUIDE.md`
- **FAQ** : `FAQ.md`
- **Installation** : `INSTALLATION.md`

---

## 🎉 C'est parti !

Vous êtes prêt pour des lives TikTok interactifs !

**Bon stream ! 🚀📱✨**

---

## 📋 Checklist

- [ ] Node.js installé
- [ ] `npm install` exécuté  
- [ ] Serveur démarré
- [ ] http://localhost:8080 ouvert
- [ ] Connecté à un live TikTok
- [ ] Timer lancé
- [ ] (Optionnel) Configuré dans OBS

---

**Temps total : ~5 minutes ⏱️**
