# 🔑 Configuration des Clés API

Ce guide explique comment configurer les clés API pour les fonctionnalités de remplissage automatique.

---

## 📋 Vue d'ensemble

### Fonction 1 : Remplissage Automatique (Scan Code-Barres)
**Déclencheur** : ⚡ Automatique lors du scan  
**API** : Barcode Lookup  
**Clé nécessaire** : `NEXT_PUBLIC_BARCODE_LOOKUP_API_KEY`  
**Coût** : Gratuit (100 requêtes/jour)

### Fonction 2 : Remplissage IA Avancé (Bouton 🤖)
**Déclencheur** : 🖱️ Clic sur bouton "IA" dans le formulaire  
**API** : Anthropic Claude  
**Clé nécessaire** : `ANTHROPIC_API_KEY`  
**Coût** : Pay-as-you-go (~0.01€/produit)

---

## 🔧 Installation

### 1. Copier le fichier d'exemple

```bash
cd inventory-app
cp .env.local.example .env.local
```

### 2. Obtenir une clé Barcode Lookup API

1. Aller sur : https://www.barcodelookup.com/api
2. Cliquer sur "Get API Key"
3. S'inscrire gratuitement
4. Copier la clé API

**Plan gratuit** :
- ✅ 100 requêtes/jour
- ✅ Accès à la base de données complète
- ✅ Pas de carte bancaire requise

### 3. Obtenir une clé Anthropic Claude (Optionnel - Pour Fonction 2)

1. Aller sur : https://console.anthropic.com/
2. S'inscrire/Se connecter
3. Aller dans "API Keys"
4. Créer une nouvelle clé

**Coût estimé** :
- ~0.01€ par produit analysé
- Modèle recommandé : Claude 3.5 Sonnet

### 4. Configurer le fichier .env.local

Éditer le fichier `.env.local` :

```bash
# Fonction 1 : Remplissage basique
NEXT_PUBLIC_BARCODE_LOOKUP_API_KEY=your_actual_key_here

# Fonction 2 : Remplissage IA (optionnel)
ANTHROPIC_API_KEY=your_actual_key_here

# Supabase (déjà configuré normalement)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Redémarrer l'application

```bash
npm run dev
```

---

## 🧪 Test de la configuration

### Tester la Fonction 1 (Barcode Lookup)

1. Scanner un code-barres ou entrer manuellement
2. Vérifier les logs dans la console navigateur :
   - ✅ `[Fonction 1] Appel Barcode Lookup API...`
   - ✅ `[Fonction 1] Réponse API:`
   - ✅ `[Fonction 1] Données extraites:`

3. Les champs suivants devraient se remplir automatiquement **SI VIDES** :
   - Nom du produit
   - Marque
   - Fabricant
   - Description courte
   - Catégorie

**⚠️ Important** : Les champs **ne s'écrasent PAS** s'ils contiennent déjà des données.

---

## 🔒 Sécurité

### Variables publiques vs privées

- `NEXT_PUBLIC_*` : Exposées au navigateur (OK pour Barcode Lookup)
- Sans préfixe : Côté serveur uniquement (pour Claude API)

### Fichier .env.local

⚠️ **NE JAMAIS** commiter le fichier `.env.local` !

Il est déjà dans `.gitignore` par défaut.

---

## ❓ Dépannage

### Erreur : "Pas de clé API Barcode Lookup configurée"

**Cause** : La clé n'est pas configurée ou incorrecte

**Solution** :
1. Vérifier que `.env.local` existe
2. Vérifier que la clé commence par `NEXT_PUBLIC_`
3. Redémarrer `npm run dev`

### Erreur : "API Error: 403"

**Cause** : Clé API invalide ou limite quotidienne atteinte

**Solution** :
1. Vérifier la clé sur barcodelookup.com
2. Vérifier le quota restant (100/jour gratuit)
3. Attendre minuit UTC pour reset

### Aucun produit trouvé

**Cause** : Code-barres inconnu dans la base de données

**Solution** :
- Normal pour certains produits tech récents
- Utiliser la Fonction 2 (Bouton IA) pour recherche avancée
- Remplir manuellement si nécessaire

---

## 📊 Limites et Quotas

| API | Plan Gratuit | Limite | Reset |
|-----|-------------|--------|-------|
| Barcode Lookup | ✅ Oui | 100 req/jour | Minuit UTC |
| Claude (Fonction 2) | ❌ Non | Pay-as-you-go | - |

---

## 🚀 Prochaines étapes

Une fois la Fonction 1 configurée et testée :
1. ✅ Tester avec plusieurs codes-barres
2. ✅ Vérifier que seuls les champs vides sont remplis
3. ➡️ Passer à la Fonction 2 (Bouton IA avec Claude)

---

*Dernière mise à jour : Janvier 2025*

