# 🚀 Proposition : Fetch IA Multiple en Parallèle

## 📊 Problématique

L'utilisateur souhaite lancer le fetch IA (métadonnées + images) sur **plusieurs produits à la fois**.

---

## 🎯 Solution Proposée : Batch Processing Client-Side

### **Architecture**

```
┌─────────────────────────────────────────┐
│     Liste Produits avec Sélection      │
│  ☑️ Sonos Roam                         │
│  ☑️ UniFi Dream Machine                │
│  ☑️ Sonos Era 100                      │
│  ☐ Autre produit                       │
│                                         │
│  [⭐ Remplir 3 produits sélectionnés]  │
└─────────────────────────────────────────┘
         ↓
  Traitement en parallèle (max 3 à la fois)
         ↓
┌─────────────────────────────────────────┐
│   Progression en temps réel             │
│  ✅ Sonos Roam (26 images, 8 metas)    │
│  🔄 UniFi Dream Machine (Classification)│
│  ⏳ Sonos Era 100 (En attente...)       │
└─────────────────────────────────────────┘
```

---

## 💡 Option 1 : Client-Side avec Limite (RECOMMANDÉ)

### **Avantages** ✅
- ✅ Pas de modification backend
- ✅ Contrôle utilisateur (sélection + annulation)
- ✅ Feedback temps réel
- ✅ Limite de 3 produits en parallèle (évite surcharge)

### **Implémentation**

```typescript
// Dans page.tsx
const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
const [batchProgress, setBatchProgress] = useState<Map<string, AIFillStep>>(new Map());

const handleBatchAIFill = async () => {
  const productsToProcess = Array.from(selectedProducts)
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  // Traiter par batch de 3
  const BATCH_SIZE = 3;
  for (let i = 0; i < productsToProcess.length; i += BATCH_SIZE) {
    const batch = productsToProcess.slice(i, i + BATCH_SIZE);
    
    await Promise.allSettled(
      batch.map(product => 
        handleAIFill(product, (step) => {
          setBatchProgress(prev => new Map(prev).set(product.id, step));
        })
      )
    );
  }
};
```

### **UI Proposée**

```tsx
{/* Checkbox dans chaque ligne */}
<input 
  type="checkbox"
  checked={selectedProducts.has(product.id)}
  onChange={() => toggleProductSelection(product.id)}
/>

{/* Barre d'actions en haut/bas */}
{selectedProducts.size > 0 && (
  <div className="fixed bottom-4 right-4 bg-white shadow-lg p-4 rounded-lg">
    <p>{selectedProducts.size} produit(s) sélectionné(s)</p>
    <Button onClick={handleBatchAIFill}>
      ⭐ Remplir avec l'IA ({selectedProducts.size})
    </Button>
    <Button onClick={() => setSelectedProducts(new Set())}>
      Annuler
    </Button>
  </div>
)}
```

---

## 💡 Option 2 : Supabase Edge Function (AVANCÉ)

### **Avantages** ✅
- ✅ Traitement en arrière-plan
- ✅ Pas de blocage UI
- ✅ Scalable

### **Inconvénients** ❌
- ❌ Complexe à implémenter
- ❌ Nécessite Edge Function Supabase
- ❌ Difficile de monitorer en temps réel
- ❌ Coût API Claude potentiellement élevé

### **Architecture**

```
Client                  Edge Function              Supabase
  │                           │                        │
  │──── POST /edge/batch ────>│                        │
  │      [produit_ids]         │                        │
  │                            │                        │
  │<───── 202 Accepted ────────│                        │
  │      job_id: "xyz"         │                        │
  │                            │                        │
  │                            │──── Traitement ───────>│
  │                            │      en background     │
  │                            │                        │
  │──── GET /edge/job/xyz ────>│                        │
  │<───── Progress ────────────│                        │
  │      { completed: 2/5 }    │                        │
```

---

## 🎯 Recommandation

**Option 1 : Client-Side Batch Processing**

### Pourquoi ?
1. ✅ **Simple** : Pas de backend complexe
2. ✅ **Contrôle** : Utilisateur voit tout en temps réel
3. ✅ **Flexible** : Peut annuler à tout moment
4. ✅ **Testable** : Facile à débugger
5. ✅ **Rapide** : Implémentation en 1-2h

### Limites
- Max 3-5 produits en parallèle (recommandé)
- L'utilisateur doit rester sur la page
- Pas de traitement en arrière-plan

---

## 📋 Plan d'Implémentation (Option 1)

### Phase 1 : Sélection
- [ ] Ajouter checkbox sur chaque ligne produit
- [ ] État `selectedProducts: Set<string>`
- [ ] Barre d'actions flottante

### Phase 2 : Batch Processing
- [ ] Fonction `handleBatchAIFill()`
- [ ] Traitement par batch de 3
- [ ] Promise.allSettled pour gérer erreurs

### Phase 3 : Feedback Temps Réel
- [ ] État `batchProgress: Map<string, AIFillStep>`
- [ ] Affichage progression par produit
- [ ] Résumé final (X produits traités, Y erreurs)

### Phase 4 : UX
- [ ] Animation pendant traitement
- [ ] Bouton "Annuler" (AbortController)
- [ ] Toast de succès/erreur

---

## 🧪 Tests à Prévoir

- [ ] Batch de 1 produit
- [ ] Batch de 3 produits
- [ ] Batch de 10 produits (par vagues de 3)
- [ ] Gestion d'erreur (1 produit échoue)
- [ ] Annulation en cours

---

## ⚡ Alternative : File d'Attente Simple

Si on veut **éviter la complexité**, une approche encore plus simple :

```typescript
const [queue, setQueue] = useState<Product[]>([]);
const [isProcessing, setIsProcessing] = useState(false);

const addToQueue = (product: Product) => {
  setQueue(prev => [...prev, product]);
};

// Auto-process queue
useEffect(() => {
  if (queue.length > 0 && !isProcessing) {
    processNext();
  }
}, [queue, isProcessing]);

const processNext = async () => {
  setIsProcessing(true);
  const product = queue[0];
  
  try {
    await handleAIFill(product);
    setQueue(prev => prev.slice(1));
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setIsProcessing(false);
  }
};
```

**Avantage** : Ultra-simple, séquentiel
**Inconvénient** : Lent (1 par 1)

---

## 💬 Quelle Option Préférez-Vous ?

1. **Option 1** : Batch processing client-side (3 en parallèle)
2. **Option 2** : Edge Function Supabase (background)
3. **Alternative** : File d'attente simple (séquentiel)

---

**Date** : 24/10/2025
**Version** : 0.1.34
**Statut** : En attente décision utilisateur


