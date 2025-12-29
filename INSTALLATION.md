# Installation Manuelle - TikTok Auction Board

## Étape 1 : Ouvrir PowerShell en mode Administrateur

1. Cliquez sur le menu Démarrer Windows
2. Tapez "PowerShell"
3. **Clic droit** sur "Windows PowerShell"
4. Sélectionnez **"Exécuter en tant qu'administrateur"**

## Étape 2 : Autoriser l'exécution de scripts (une seule fois)

Dans PowerShell administrateur, tapez :

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Tapez **O** (Oui) pour confirmer.

## Étape 3 : Installer les dépendances

Dans PowerShell (normal ou admin), naviguez vers le dossier server :

```powershell
cd C:\Users\danie\Desktop\tableau\server
```

Puis installez les packages :

```powershell
npm install
```

Attendez quelques secondes que l'installation se termine.

## Étape 4 : Démarrer le serveur

### Option A : Avec le script batch (recommandé)

Double-cliquez sur :
```
C:\Users\danie\Desktop\tableau\START_SERVER.bat
```

### Option B : Manuellement avec PowerShell

```powershell
cd C:\Users\danie\Desktop\tableau\server
npm start
```

## Étape 5 : Ouvrir l'overlay

Double-cliquez sur :
```
C:\Users\danie\Desktop\tableau\index.html
```

---

## ✅ Vérification

Si tout fonctionne, vous devriez voir :

**Dans PowerShell :**
```
🚀 WebSocket server running on ws://localhost:8080
📱 Waiting for overlay to connect...
```

**Dans le navigateur :**
- Interface avec panneau de contrôle à gauche
- Statut "Déconnecté" (normal, vous n'êtes pas encore connecté à TikTok)

---

## 🆘 En cas de problème

### "npm : Impossible de charger le fichier..."

➡️ Suivez l'Étape 2 ci-dessus pour autoriser les scripts

### "npm n'est pas reconnu..."

➡️ Installez Node.js depuis https://nodejs.org/
   Puis redémarrez PowerShell

### Port 8080 déjà utilisé

➡️ Un autre programme utilise le port 8080
   Éditez `server/server.js` et changez :
   ```javascript
   const PORT = process.env.PORT || 8081;
   ```
   
   Et dans `app.js` changez :
   ```javascript
   wsUrl: 'ws://localhost:8081'
   ```

---

## 🎉 Prêt !

Vous pouvez maintenant utiliser l'application !

Consultez **GUIDE.md** pour les instructions complètes d'utilisation.
