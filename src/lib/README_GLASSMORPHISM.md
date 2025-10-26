# 🎨 Système Glassmorphism Unifié

Ce module fournit des styles glassmorphism réutilisables pour toute l'application, garantissant une cohérence visuelle et facilitant les modifications globales.

## 📦 Utilisation de Base

```typescript
import { GLASS_STYLES } from '@/lib/glassmorphism';

// Header sticky en haut
<div className={GLASS_STYLES.stickyTop}>
  Header avec glassmorphism
</div>

// Footer sticky en bas
<div className={GLASS_STYLES.stickyBottom}>
  Footer avec glassmorphism
</div>

// Ligne d'entêtes de colonnes
<div className={GLASS_STYLES.columnHeader}>
  Entêtes de colonnes
</div>
```

## 🎯 Styles Disponibles

### `GLASS_STYLES.base`
Effet glassmorphism de base sans positionnement.
```typescript
<div className={GLASS_STYLES.base}>
  Contenu avec effet de verre
</div>
```

### `GLASS_STYLES.stickyTop`
Header sticky en haut avec glassmorphism.
- Position: `top-0`
- Z-index: `10`
- Bordure: bas

### `GLASS_STYLES.stickyBottom`
Footer sticky en bas avec glassmorphism.
- Position: `bottom-0`
- Z-index: `10`
- Bordure: haut

### `GLASS_STYLES.columnHeader`
Ligne d'entêtes sous un header.
- Position: `top-[69px]` (sous header de 69px)
- Z-index: `9`
- Bordure: bas

### `GLASS_STYLES.modal`
Modal ou dialog avec glassmorphism.

### `GLASS_STYLES.card`
Card avec effet glassmorphism léger.

## 🔧 Fonction Helper

### `createGlassSticky(topValue, zIndex?)`

Crée un sticky glassmorphism avec position personnalisée.

```typescript
import { createGlassSticky } from '@/lib/glassmorphism';

// Sticky à 120px du haut avec z-index 15
const customSticky = createGlassSticky("120px", 15);

<div className={customSticky}>
  Contenu sticky personnalisé
</div>
```

## 🎨 Variations d'Opacité

Pour ajuster l'intensité de l'effet :

```typescript
import { GLASS_OPACITY } from '@/lib/glassmorphism';

<div className={GLASS_OPACITY.light}>   {/* 80% opacité */}
<div className={GLASS_OPACITY.medium}>  {/* 90% opacité */}
<div className={GLASS_OPACITY.strong}>  {/* 95% opacité - Défaut */}
<div className={GLASS_OPACITY.full}>    {/* 100% opacité */}
```

## 📝 Exemples Complets

### Liste avec Header, Colonnes et Footer

```typescript
import { GLASS_STYLES } from '@/lib/glassmorphism';

<div>
  {/* Header de recherche */}
  <div className={GLASS_STYLES.stickyTop}>
    <SearchBar />
  </div>

  {/* Entêtes de colonnes */}
  <div className={GLASS_STYLES.columnHeader}>
    <ColumnHeaders />
  </div>

  {/* Contenu */}
  <div>
    {items.map(item => <Item key={item.id} {...item} />)}
  </div>

  {/* Footer avec totaux */}
  <div className={GLASS_STYLES.stickyBottom}>
    <TotalRow />
  </div>
</div>
```

## ⚙️ Modification Globale

Pour modifier l'effet glassmorphism dans toute l'application :

1. Ouvrir `src/lib/glassmorphism.ts`
2. Modifier les valeurs dans `GLASS_STYLES`
3. Toute l'app sera mise à jour automatiquement !

### Exemple : Augmenter l'opacité

```typescript
// Dans glassmorphism.ts
export const GLASS_STYLES = {
  base: "bg-background/98 backdrop-blur-3xl...",  // 90→98, xl→3xl
  // ...
}
```

## 🎯 Valeurs CSS Utilisées

- **Opacité background** : 95% (fort), 90% (moyen), 80% (léger)
- **Blur** : 
  - `backdrop-blur-xl` : 24px
  - `backdrop-blur-2xl` : 40px
  - `backdrop-blur-3xl` : 64px
- **Bordure** : `border-border/40` (opacité 40%)
- **Support navigateur** : `supports-[backdrop-filter]:` pour compatibilité

## 📋 Checklist d'Utilisation

- ✅ Importer `GLASS_STYLES` depuis `@/lib/glassmorphism`
- ✅ Utiliser les constantes au lieu de classes dupliquées
- ✅ Ne PAS écrire `bg-background/90 backdrop-blur...` manuellement
- ✅ Utiliser `createGlassSticky()` pour positions personnalisées
- ✅ Tester sur différents navigateurs

## 🌐 Compatibilité

L'effet glassmorphism utilise :
- `backdrop-filter: blur()` : Supporté par 95% des navigateurs modernes
- Fallback automatique via `supports-[backdrop-filter]:`
- Opacité ajustée selon le support

## 🎨 Design System

Ce système fait partie du design system Shadcn/ui et utilise :
- Variables CSS Tailwind (`bg-background`, `border-border`)
- Classes utilitaires Tailwind
- Support du dark mode automatique


