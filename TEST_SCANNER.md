# 🔍 TEST DU SCANNER - INVENTORY MANAGER

## Diagnostic du scanner de codes-barres

### Composant actuel

✅ **html5-qrcode v2.3.8** installé  
✅ **BarcodeScanner.tsx** implémenté  
✅ **Intégré** dans ProductInspector  

### Test à effectuer

**Pour vérifier si le scanner fonctionne :**

1. Ouvrir http://localhost:3000
2. Cliquer sur un produit pour ouvrir l'inspecteur
3. Dans le champ "Code-barres (SKU)", cliquer sur l'icône caméra 📷
4. Observer ce qui se passe :
   - ✅ Le scanner s'ouvre ?
   - ✅ La caméra démarre ?
   - ✅ Le scan détecte un code ?
   - ❌ Erreur affichée ?

### Problèmes potentiels

1. **Permissions caméra** non accordées
2. **HTTPS requis** (Safari/iOS strict)
3. **Element DOM** non trouvé
4. **Multiples instances** du scanner

### Solutions rapides

**Si le scanner ne s'ouvre pas :**
- Vérifier la console Chrome pour les erreurs
- Vérifier que l'élément DOM existe

**Si la caméra ne démarre pas :**
- Accorder les permissions caméra
- Vérifier que vous êtes en HTTPS (ou localhost)

**Si le scan ne détecte rien :**
- Vérifier l'éclairage
- Essayer la saisie manuelle (bouton "Manuel")

---

**🔧 Test en cours...**

