# 🤖 Phase 2 : Intégration IA - Enrichissement Automatique

## Vue d'Ensemble

La Phase 2 ajoutera l'enrichissement automatique des métadonnées produits en utilisant :

1. **Claude API** (Anthropic) - Scraping intelligent
2. **APIs Produits** - Bases de données universelles
3. **Auto-complétion** - Remplissage automatique

## 🎯 Objectifs

Lorsqu'un utilisateur scanne un code-barres :

1. ✅ Scan du code → barcode extrait
2. 🤖 **NOUVEAU** : Recherche automatique dans les APIs
3. 🤖 **NOUVEAU** : Si aucune donnée → Claude scrape le web
4. ✅ Formulaire pré-rempli avec toutes les infos
5. ✅ Utilisateur valide/modifie/enregistre

## 📦 APIs Produits Disponibles

### 1. Open Food Facts API

**Pour** : Produits alimentaires

**Gratuit** : Oui, open-source

**Endpoint** :
```
https://world.openfoodfacts.org/api/v0/product/[barcode].json
```

**Exemple** :
```bash
curl https://world.openfoodfacts.org/api/v0/product/3017620422003.json
```

**Données** :
- Nom du produit
- Marque
- Catégories
- Nutriscore
- Image
- Ingrédients

**Installation** :
```bash
npm install --save axios
```

**Code** :
```typescript
// src/lib/product-apis.ts
import axios from 'axios';

export async function fetchOpenFoodFacts(barcode: string) {
  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    
    if (response.data.status === 1) {
      const product = response.data.product;
      return {
        name: product.product_name,
        manufacturer: product.brands,
        category: product.categories_tags?.[0],
        image_url: product.image_url,
        metadata: {
          nutriscore: product.nutriscore_grade,
          ingredients: product.ingredients_text,
        },
      };
    }
    return null;
  } catch (error) {
    console.error('OpenFoodFacts API error:', error);
    return null;
  }
}
```

### 2. UPC Database

**Pour** : Tous types de produits

**Gratuit** : API limitée (100 requêtes/jour)

**Site** : [upcdatabase.org](https://www.upcdatabase.org)

**Endpoint** :
```
https://api.upcdatabase.org/product/[barcode]/[API_KEY]
```

**Données** :
- Nom
- Marque
- Catégorie
- Image (parfois)

### 3. Barcode Lookup

**Pour** : Produits généraux

**Prix** : Gratuit (500 req/mois) ou payant

**Site** : [barcodelookup.com](https://www.barcodelookup.com)

**Endpoint** :
```
https://api.barcodelookup.com/v3/products?barcode=[barcode]&key=[API_KEY]
```

### 4. GS1 API (Officiel)

**Pour** : Base officielle des codes-barres

**Prix** : Payant

**Site** : [gs1.org](https://www.gs1.org)

## 🧠 Claude API - Scraping Intelligent

### Installation

```bash
npm install @anthropic-ai/sdk
```

### Configuration

Ajouter dans `.env.local` :
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### Code d'Intégration

```typescript
// src/lib/claude-scraper.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function enrichProductWithClaude(barcode: string, existingData?: any) {
  const prompt = `Tu es un assistant spécialisé dans la recherche de produits.

Code-barres: ${barcode}
${existingData ? `Données existantes: ${JSON.stringify(existingData)}` : ''}

Recherche ce produit sur internet et retourne un JSON avec:
- name: nom complet du produit
- manufacturer: fabricant/marque
- category: catégorie principale
- image_url: URL d'une image du produit
- description: description courte
- metadata: autres infos pertinentes (prix indicatif, dimensions, etc.)

Si tu ne trouves rien, retourne null pour chaque champ.

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return null;
  } catch (error) {
    console.error('Claude API error:', error);
    return null;
  }
}
```

## 🔄 Flux d'Enrichissement

### Service Unifié

```typescript
// src/lib/product-enrichment.ts
import { fetchOpenFoodFacts } from './product-apis';
import { enrichProductWithClaude } from './claude-scraper';

export async function enrichProduct(barcode: string) {
  // 1. Essayer Open Food Facts d'abord (gratuit, rapide)
  console.log('🔍 Recherche dans Open Food Facts...');
  let data = await fetchOpenFoodFacts(barcode);
  
  if (data) {
    console.log('✅ Données trouvées dans Open Food Facts');
    return { source: 'openfoodfacts', data };
  }

  // 2. Essayer UPC Database
  console.log('🔍 Recherche dans UPC Database...');
  // TODO: implémenter fetchUPCDatabase
  
  // 3. Si rien trouvé, utiliser Claude
  console.log('🤖 Enrichissement avec Claude AI...');
  data = await enrichProductWithClaude(barcode);
  
  if (data) {
    console.log('✅ Données trouvées par Claude');
    return { source: 'claude', data };
  }

  console.log('❌ Aucune donnée trouvée');
  return null;
}
```

### Intégration dans le Scanner

Modifier `src/app/page.tsx` :

```typescript
const handleScanSuccess = async (barcode: string) => {
  setShowScanner(false);
  setIsLoading(true);
  
  // Vérifier si le produit existe déjà
  const existingProduct = await ProductService.getByBarcode(barcode);
  
  if (existingProduct) {
    setEditingProduct(existingProduct);
    setShowProductForm(true);
    setIsLoading(false);
    return;
  }

  // Nouveau produit → enrichir automatiquement
  console.log('🤖 Enrichissement automatique...');
  const enrichedData = await enrichProduct(barcode);
  
  if (enrichedData) {
    // Pré-remplir le formulaire
    setEnrichedProductData({
      barcode,
      ...enrichedData.data,
    });
    
    // Afficher une notification
    toast.success(`Données trouvées via ${enrichedData.source}`);
  } else {
    // Aucune donnée → formulaire vide
    setScannedBarcode(barcode);
  }
  
  setShowProductForm(true);
  setIsLoading(false);
};
```

## 🎨 Interface Utilisateur

### Indicateur d'Enrichissement

```tsx
{isEnriching && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <Card className="max-w-md">
      <CardContent className="p-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
        <h3 className="text-lg font-semibold mb-2">
          🤖 Enrichissement en cours...
        </h3>
        <p className="text-sm text-gray-600">
          Recherche des informations sur le produit
        </p>
        <div className="mt-4 space-y-2 text-xs text-gray-500">
          <p>✓ Open Food Facts</p>
          <p className="animate-pulse">⏳ Claude AI...</p>
        </div>
      </CardContent>
    </Card>
  </div>
)}
```

### Badge de Source

```tsx
{productData.source && (
  <Badge variant="outline" className="mb-4">
    📡 Données de {productData.source}
  </Badge>
)}
```

## 📊 Gestion du Cache

Pour éviter de faire des requêtes répétées :

```typescript
// src/lib/cache.ts
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24h

export function getCachedProduct(barcode: string) {
  const entry = cache.get(barcode);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }
  return null;
}

export function cacheProduct(barcode: string, data: any) {
  cache.set(barcode, {
    data,
    timestamp: Date.now(),
  });
}
```

## 🗃️ Stockage des Métadonnées

Les métadonnées enrichies sont stockées dans `products.metadata` (JSONB) :

```typescript
{
  "source": "openfoodfacts",
  "enriched_at": "2024-01-22T10:30:00Z",
  "nutriscore": "A",
  "ingredients": "...",
  "price_range": "10-15 EUR",
  "dimensions": "10x5x2 cm",
  // etc.
}
```

## 🔒 Sécurité

⚠️ **Important** : Les clés API doivent rester côté serveur !

### API Routes

Créer une API route pour l'enrichissement :

```typescript
// src/app/api/enrich/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { enrichProduct } from '@/lib/product-enrichment';

export async function POST(request: NextRequest) {
  const { barcode } = await request.json();
  
  if (!barcode) {
    return NextResponse.json(
      { error: 'Barcode is required' },
      { status: 400 }
    );
  }

  const data = await enrichProduct(barcode);
  
  return NextResponse.json({ data });
}
```

Appeler depuis le client :

```typescript
const response = await fetch('/api/enrich', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ barcode }),
});

const { data } = await response.json();
```

## 📈 Monitoring

### Suivi des Sources

Ajouter une table `enrichment_stats` :

```sql
CREATE TABLE enrichment_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode VARCHAR(255),
  source VARCHAR(50), -- 'openfoodfacts', 'claude', 'manual'
  success BOOLEAN,
  response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Analytics

```typescript
async function logEnrichment(
  barcode: string,
  source: string,
  success: boolean,
  responseTime: number
) {
  await supabase.from('enrichment_stats').insert({
    barcode,
    source,
    success,
    response_time_ms: responseTime,
  });
}
```

## 💰 Coûts Estimés

### APIs Gratuites
- **Open Food Facts** : Gratuit illimité
- **Claude API** : ~$0.003 par requête (Sonnet)

### Pour 100 Produits/Mois
- 80% trouvés dans Open Food Facts : **Gratuit**
- 20% enrichis par Claude : **~$0.06**

### Pour 1000 Produits/Mois
- 80% trouvés dans Open Food Facts : **Gratuit**
- 200 enrichis par Claude : **~$0.60**

→ **Très abordable !**

## 🧪 Tests

```typescript
// test/enrichment.test.ts
import { enrichProduct } from '@/lib/product-enrichment';

describe('Product Enrichment', () => {
  it('should find food product in OpenFoodFacts', async () => {
    const result = await enrichProduct('3017620422003'); // Nutella
    expect(result?.source).toBe('openfoodfacts');
    expect(result?.data.name).toContain('Nutella');
  });

  it('should fallback to Claude for unknown products', async () => {
    const result = await enrichProduct('9999999999999');
    expect(result?.source).toBe('claude');
  });
});
```

## 📝 Checklist d'Implémentation

- [ ] Installer `@anthropic-ai/sdk` et `axios`
- [ ] Créer `.env.local` avec `ANTHROPIC_API_KEY`
- [ ] Implémenter `product-apis.ts`
- [ ] Implémenter `claude-scraper.ts`
- [ ] Créer `product-enrichment.ts`
- [ ] Créer API route `/api/enrich`
- [ ] Modifier le scanner pour utiliser l'enrichissement
- [ ] Ajouter UI d'indicateur d'enrichissement
- [ ] Implémenter le cache
- [ ] Ajouter le tracking dans `enrichment_stats`
- [ ] Tester avec différents codes-barres
- [ ] Documenter pour les utilisateurs

## 🚀 Prochaines Étapes

Après la Phase 2, envisager :

### Phase 2.5 : Améliorations
- Suggestions de catégories intelligentes
- Détection automatique de doublons
- Correction orthographique des noms
- Traduction automatique

### Phase 3 : Features Avancées
- Historique d'enrichissement
- Feedback utilisateur (données correctes ?)
- Apprentissage : améliorer les résultats
- Export des métadonnées enrichies

---

**Avec la Phase 2, votre application deviendra vraiment intelligente ! 🤖✨**

