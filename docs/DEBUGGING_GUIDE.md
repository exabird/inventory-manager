# 🔧 GUIDE COMPLET DE DEBUGGING - INVENTORY MANAGER

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Outils de debugging](#outils-de-debugging)
3. [Monitoring en temps réel](#monitoring-en-temps-réel)
4. [Debugging par composant](#debugging-par-composant)
5. [Erreurs courantes et solutions](#erreurs-courantes-et-solutions)
6. [Logs et monitoring](#logs-et-monitoring)
7. [Processus de debugging](#processus-de-debugging)

---

## 🎯 VUE D'ENSEMBLE

### Architecture de l'application

```
┌─────────────────────────────────────────────┐
│           FRONTEND (Next.js 16)             │
│  ┌──────────────────────────────────────┐  │
│  │  React Components (Client-side)      │  │
│  │  - ProductList                        │  │
│  │  - ProductForm                        │  │
│  │  - BarcodeScanner                     │  │
│  └──────────────────────────────────────┘  │
│               ↓                             │
│  ┌──────────────────────────────────────┐  │
│  │  Services (lib/)                      │  │
│  │  - ProductService                     │  │
│  │  - CategoryService                    │  │
│  │  - StockService                       │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────┐
│         BACKEND (Supabase)                  │
│  ┌──────────────────────────────────────┐  │
│  │  Database (PostgreSQL)               │  │
│  │  - products                           │  │
│  │  - categories                         │  │
│  │  - stock_operations                   │  │
│  │  - pieces                             │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  Storage (Images)                     │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Flux de données typique

1. **Chargement de produits** : `Page → ProductService.getAll() → Supabase → État React`
2. **Ajout de produit** : `Formulaire → ProductService.create() → Supabase → Rechargement`
3. **Modification stock** : `UI → ProductService.updateQuantity() → Supabase → Mise à jour état`

---

## 🛠️ OUTILS DE DEBUGGING

### 1. Console Chrome DevTools

#### Activer les logs détaillés
Ouvrir la console : `F12` ou `Cmd+Option+J` (Mac) / `Ctrl+Shift+J` (Windows)

#### Filtres console utiles
```javascript
// Afficher uniquement les logs de ProductService
console.log filters: "ProductService"

// Afficher uniquement les erreurs Supabase
console.log filters: "⚠️ Erreur"

// Afficher tous les logs liés au stock
console.log filters: "stock"
```

#### Points d'arrêt (Breakpoints)
1. Ouvrir DevTools → Sources
2. Naviguer vers le fichier (ex: `ProductService.ts`)
3. Cliquer sur le numéro de ligne pour ajouter un point d'arrêt
4. Recharger la page ou déclencher l'action

### 2. React DevTools

#### Installation
- Extension Chrome : [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

#### Utilisation
1. Ouvrir DevTools → React
2. Inspecter les composants
3. Voir les props et l'état
4. Modifier l'état en temps réel pour tester

### 3. Network Panel

#### Surveiller les requêtes Supabase
1. DevTools → Network
2. Filtrer par "supabase"
3. Examiner :
   - Request Headers (clés API)
   - Request Payload (données envoyées)
   - Response (données reçues)
   - Status Code (200 OK, 400 erreur, etc.)

### 4. Application Panel

#### Vérifier le Storage
1. DevTools → Application
2. Local Storage → `http://localhost:3000`
3. Session Storage
4. Cookies

---

## 📊 MONITORING EN TEMPS RÉEL

### Script de monitoring console (monitor-console.js)

Créez ce script pour capturer tous les logs en temps réel :

```javascript
// /Users/anthony/Cursor/Inventor AI/inventory-app/monitor-console.js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true 
  });
  
  const page = await browser.newPage();
  
  // Capturer tous les logs console
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${text}`);
  });
  
  // Capturer les erreurs
  page.on('pageerror', error => {
    console.error(`[PAGE ERROR] ${error.message}`);
  });
  
  // Capturer les erreurs réseau
  page.on('requestfailed', request => {
    console.error(`[NETWORK ERROR] ${request.url()} - ${request.failure().errorText}`);
  });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  console.log('🔍 Monitoring en cours... Appuyez sur Ctrl+C pour arrêter');
})();
```

**Utilisation :**
```bash
node monitor-console.js
```

### Script de monitoring avancé avec filtres

```javascript
// /Users/anthony/Cursor/Inventor AI/inventory-app/monitor-console-advanced.js
const puppeteer = require('puppeteer');
const fs = require('fs');

const LOG_FILE = './console-logs.txt';
const ERROR_LOG_FILE = './error-logs.txt';

// Configurer les filtres
const FILTERS = {
  includeTypes: ['log', 'warn', 'error'], // Types de logs à inclure
  keywords: ['ProductService', 'Supabase', 'stock'], // Mots-clés à surveiller
  excludeKeywords: ['DevTools'] // Mots-clés à exclure
};

function shouldLogMessage(message, type) {
  if (!FILTERS.includeTypes.includes(type)) return false;
  
  const hasKeyword = FILTERS.keywords.length === 0 || 
    FILTERS.keywords.some(kw => message.includes(kw));
    
  const hasExclude = FILTERS.excludeKeywords.some(kw => message.includes(kw));
  
  return hasKeyword && !hasExclude;
}

(async () => {
  // Créer/vider les fichiers de log
  fs.writeFileSync(LOG_FILE, `=== Session démarrée: ${new Date().toISOString()} ===\n`);
  fs.writeFileSync(ERROR_LOG_FILE, `=== Session démarrée: ${new Date().toISOString()} ===\n`);
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true 
  });
  
  const page = await browser.newPage();
  
  // Capturer les logs console
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const timestamp = new Date().toISOString();
    
    if (shouldLogMessage(text, type)) {
      const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${text}\n`;
      console.log(logEntry.trim());
      fs.appendFileSync(LOG_FILE, logEntry);
      
      if (type === 'error' || type === 'warn') {
        fs.appendFileSync(ERROR_LOG_FILE, logEntry);
      }
    }
  });
  
  // Capturer les erreurs page
  page.on('pageerror', error => {
    const logEntry = `[${new Date().toISOString()}] [PAGE ERROR] ${error.message}\n${error.stack}\n`;
    console.error(logEntry);
    fs.appendFileSync(ERROR_LOG_FILE, logEntry);
  });
  
  // Capturer les requêtes réseau
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('supabase.co')) {
      const status = response.status();
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] [NETWORK] ${status} ${url}\n`;
      
      console.log(logEntry.trim());
      fs.appendFileSync(LOG_FILE, logEntry);
      
      if (status >= 400) {
        try {
          const body = await response.text();
          const errorEntry = `[${timestamp}] [NETWORK ERROR] ${status} ${url}\n${body}\n`;
          console.error(errorEntry);
          fs.appendFileSync(ERROR_LOG_FILE, errorEntry);
        } catch (e) {
          // Ignorer si le corps ne peut pas être lu
        }
      }
    }
  });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  console.log('🔍 Monitoring avancé en cours...');
  console.log(`📝 Logs: ${LOG_FILE}`);
  console.log(`❌ Erreurs: ${ERROR_LOG_FILE}`);
  console.log('Appuyez sur Ctrl+C pour arrêter');
})();
```

**Utilisation :**
```bash
node monitor-console-advanced.js
```

---

## 🧩 DEBUGGING PAR COMPOSANT

### ProductService (src/lib/services.ts)

#### Points de vérification
1. **Connexion Supabase** : Vérifier que `supabase` est correctement initialisé
2. **Requêtes** : Vérifier les logs `console.log` dans chaque méthode
3. **Erreurs** : Examiner les objets `error` retournés par Supabase

#### Logs clés à surveiller
```javascript
// Chargement des produits
console.log('📦 ProductService.getAll() - Début requête...');
console.log('✅ ProductService.getAll() - Références récupérées:', data?.length || 0);

// Création de produit
console.log('➕ ProductService.create() - Création référence:', product);
console.log('✅ ProductService.create() - Référence créée:', data);

// Erreurs
console.warn('⚠️ Erreur lors du chargement des produits:', error);
```

#### Debugging avec React DevTools
1. Ouvrir React DevTools
2. Sélectionner le composant `Home`
3. Examiner l'état `products`
4. Vérifier `isLoading` et `selectedProduct`

### Page principale (src/app/page.tsx)

#### Points de vérification
1. **useEffect** : S'assurer que `loadProducts()` est appelé au montage
2. **État products** : Vérifier que les données sont correctement nettoyées
3. **Filtres** : Tester la recherche avec différents critères

#### Tests manuels
```javascript
// Dans la console Chrome, tester l'état du composant
// 1. Chercher le composant dans React DevTools
// 2. Examiner les props et l'état
// 3. Modifier l'état pour tester les comportements
```

### CompactProductList (src/components/inventory/CompactProductList.tsx)

#### Points de vérification
1. **Tri** : Vérifier que `sortProducts()` fonctionne correctement
2. **Filtres** : Tester les filtres de catégorie, stock, prix
3. **Colonnes** : Vérifier la visibilité des colonnes

#### Erreurs courantes
- **Erreur de tri** : Vérifier les valeurs `null` ou `undefined` dans les données
- **Erreur de filtre** : S'assurer que les catégories existent
- **Erreur d'affichage** : Vérifier les types des valeurs (string, number)

### BarcodeScanner (src/components/scanner/BarcodeScanner.tsx)

#### Points de vérification
1. **Permissions caméra** : Vérifier que l'utilisateur a autorisé l'accès
2. **HTTPS** : En production, la caméra nécessite HTTPS
3. **Format codes-barres** : Tester avec différents formats (UPC-A, EAN-13, QR)

#### Debugging caméra
```javascript
// Vérifier les permissions caméra
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('✅ Caméra accessible', stream);
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error('❌ Erreur caméra:', err));
```

---

## ⚠️ ERREURS COURANTES ET SOLUTIONS

### 1. Erreur de connexion Supabase

**Symptômes :**
```
⚠️ Erreur lors du chargement des produits: {...}
```

**Solutions :**
1. Vérifier les variables d'environnement `.env.local`
2. Vérifier que les clés Supabase sont valides
3. Tester la connexion directement :
```javascript
const { data, error } = await supabase.from('products').select('count');
console.log('Test connexion:', data, error);
```

### 2. Erreur de contrainte NULL

**Symptômes :**
```
new row for relation "products" violates check constraint
null value in column "name" violates not-null constraint
```

**Solutions :**
1. Vérifier que tous les champs obligatoires sont remplis
2. Nettoyer les données avant insertion :
```javascript
const cleanedData = {
  ...product,
  name: product.name || '',
  internal_ref: product.internal_ref || '',
  quantity: product.quantity || 0
};
```

### 3. Erreur d'hydratation React

**Symptômes :**
```
Warning: Text content did not match. Server: "..." Client: "..."
Error: Hydration failed because the initial UI does not match what was rendered on the server
```

**Solutions :**
1. Utiliser `ClientOnly` pour les composants côté client uniquement
2. Éviter les valeurs aléatoires ou dates côté serveur
3. S'assurer que les conditions de rendu sont identiques

### 4. Erreur de caméra en développement local

**Symptômes :**
```
NotAllowedError: Permission denied
DOMException: Could not start video source
```

**Solutions :**
1. Utiliser HTTPS en local : `https://localhost:3000`
2. Ajouter une exception pour `localhost` dans les permissions navigateur
3. Sur iOS Safari, activer "Autoriser les sites non sécurisés" en développement

### 5. Erreur de type TypeScript

**Symptômes :**
```
Type 'null' is not assignable to type 'string'
Property 'categories' does not exist on type 'Product'
```

**Solutions :**
1. Utiliser des types stricts avec `| null`
2. Vérifier les valeurs avec des conditions :
```typescript
const categoryName = product.categories?.name || 'Sans catégorie';
```

---

## 📝 LOGS ET MONITORING

### Logs Supabase (via MCP)

```bash
# Logs API (requêtes HTTP)
# Utiliser MCP Supabase : get_logs(service: "api")

# Logs Postgres (requêtes SQL)
# Utiliser MCP Supabase : get_logs(service: "postgres")

# Logs Storage (upload fichiers)
# Utiliser MCP Supabase : get_logs(service: "storage")
```

### Logs Vercel (via MCP)

```bash
# Logs de build
# Utiliser MCP Vercel : get_deployment_build_logs()

# Logs de runtime
# Utiliser MCP Vercel : get_deployment(idOrUrl)
```

### Logs locaux

```bash
# Logs du serveur Next.js
tail -f dev.log

# Logs d'erreurs uniquement
grep -i 'error\|failed\|exception' dev.log

# Logs en temps réel
npm run logs
```

---

## 🔄 PROCESSUS DE DEBUGGING

### Étape 1 : Identifier le problème

1. **Observer le comportement** : Que se passe-t-il ? Que devrait-il se passer ?
2. **Reproduire** : Pouvez-vous reproduire le problème de manière fiable ?
3. **Collecter les logs** :
   - Console navigateur
   - Logs Supabase
   - Logs Vercel (si en production)

### Étape 2 : Analyser les logs

1. **Console navigateur** :
   - Ouvrir DevTools → Console
   - Chercher les erreurs (rouges)
   - Examiner les warnings (oranges)
   - Vérifier les logs custom (avec emojis)

2. **Network panel** :
   - Vérifier les requêtes Supabase
   - Examiner les status codes (200, 400, 500)
   - Voir les payloads et responses

3. **React DevTools** :
   - Inspecter l'état des composants
   - Vérifier les props passées
   - Tester en modifiant l'état manuellement

### Étape 3 : Isoler le problème

1. **Frontend ou Backend ?**
   - Tester directement dans Supabase SQL Editor
   - Si ça marche dans Supabase → Problème frontend
   - Si ça ne marche pas → Problème backend/BDD

2. **Quel composant ?**
   - Ajouter des logs temporaires :
```javascript
console.log('🔍 DEBUG - Composant monté');
console.log('🔍 DEBUG - Props:', props);
console.log('🔍 DEBUG - État:', state);
```

3. **Quelle fonction ?**
   - Ajouter des points d'arrêt (breakpoints)
   - Suivre le flux d'exécution

### Étape 4 : Tester la solution

1. **Corriger** le problème identifié
2. **Tester localement** :
```bash
npm run dev
# Tester manuellement dans le navigateur
```
3. **Vérifier les logs** : S'assurer qu'il n'y a plus d'erreurs
4. **Tester les cas limites** : Valeurs nulles, vides, incorrectes

### Étape 5 : Valider et déployer

1. **Tests de compilation** :
```bash
npm run build:check
npm run lint
npm run type-check
```

2. **Tests fonctionnels** : Tester toutes les fonctionnalités impactées

3. **Déploiement** : Suivre le processus dans `DEVELOPMENT_PROCESSES.md`

---

## 📊 CHECKLIST DE DEBUGGING

### Avant de commencer
- [ ] Problème clairement identifié et reproductible
- [ ] Environnement de développement fonctionnel (`npm run dev`)
- [ ] Console navigateur ouverte (F12)
- [ ] Logs prêts à être examinés

### Pendant le debugging
- [ ] Logs console examinés (errors, warnings)
- [ ] Network panel vérifié (requêtes Supabase)
- [ ] React DevTools utilisé (état des composants)
- [ ] Logs Supabase vérifiés (via MCP)
- [ ] Points d'arrêt ajoutés si nécessaire
- [ ] Logs temporaires ajoutés pour tracer le flux

### Tests de la solution
- [ ] Problème résolu localement
- [ ] Pas de nouvelles erreurs dans la console
- [ ] Requêtes Supabase fonctionnelles (status 200)
- [ ] État des composants correct (React DevTools)
- [ ] Tests manuels des cas limites

### Validation finale
- [ ] `npm run build:check` ✅
- [ ] `npm run lint` ✅
- [ ] `npm run type-check` ✅
- [ ] Tests fonctionnels complets ✅
- [ ] Documentation mise à jour si nécessaire
- [ ] Logs temporaires supprimés

---

## 🎯 CONSEILS PRATIQUES

### 1. Logs structurés avec emojis

Utiliser des emojis pour identifier rapidement le type de log :
```javascript
console.log('✅ Succès');
console.log('⚠️ Warning');
console.error('❌ Erreur');
console.log('🔍 Debug');
console.log('📊 Données');
console.log('🔄 Process en cours');
```

### 2. Logs détaillés dans les services

```javascript
export const ProductService = {
  async getAll(): Promise<Product[]> {
    console.log('📦 [ProductService.getAll] Début requête');
    console.log('📦 [ProductService.getAll] URL:', supabaseUrl);
    
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [ProductService.getAll] Erreur:', error);
      console.error('❌ [ProductService.getAll] Code:', error.code);
      console.error('❌ [ProductService.getAll] Message:', error.message);
      return [];
    }

    console.log('✅ [ProductService.getAll] Succès:', data.length, 'produits');
    console.log('📊 [ProductService.getAll] Données:', data);
    return data || [];
  }
};
```

### 3. Debugging React avec useEffect

```javascript
useEffect(() => {
  console.log('🔄 [useEffect] Montage du composant');
  
  loadProducts().then(() => {
    console.log('✅ [useEffect] Produits chargés');
  }).catch(error => {
    console.error('❌ [useEffect] Erreur:', error);
  });
  
  return () => {
    console.log('🔄 [useEffect] Démontage du composant');
  };
}, []);
```

### 4. Debugging Supabase avec try-catch

```javascript
async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
  try {
    console.log('➕ [ProductService.create] Données envoyées:', product);
    
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ [ProductService.create] Produit créé:', data);
    return data;
    
  } catch (error: any) {
    console.error('❌ [ProductService.create] Erreur:', error);
    console.error('❌ [ProductService.create] Code:', error.code);
    console.error('❌ [ProductService.create] Message:', error.message);
    console.error('❌ [ProductService.create] Details:', error.details);
    return null;
  }
}
```

---

## 🚀 OUTILS ADDITIONNELS

### Puppeteer pour tests automatisés

```javascript
// test-automated.js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Naviguer vers la page
  await page.goto('http://localhost:3000');
  
  // Attendre que les produits soient chargés
  await page.waitForSelector('.product-list-item', { timeout: 5000 });
  
  // Compter les produits
  const productCount = await page.$$eval('.product-list-item', items => items.length);
  console.log(`✅ ${productCount} produits chargés`);
  
  // Tester la recherche
  await page.type('input[placeholder="Chercher..."]', 'test');
  await page.waitForTimeout(1000);
  
  const filteredCount = await page.$$eval('.product-list-item', items => items.length);
  console.log(`✅ ${filteredCount} produits après recherche`);
  
  await browser.close();
})();
```

---

**📝 Ce guide doit être consulté en premier lors de tout problème de développement ou de debugging.**

