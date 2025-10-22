#!/bin/bash

# Script de mise à jour de version pour Inventory Manager
# Usage: ./scripts/version-update.sh [patch|minor|major]

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour logger
log() {
    echo -e "${BLUE}[VERSION]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    error "Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Récupérer la version actuelle
CURRENT_VERSION=$(grep '"version"' package.json | sed 's/.*"version": "\(.*\)".*/\1/')
log "Version actuelle: $CURRENT_VERSION"

# Déterminer le type de mise à jour
UPDATE_TYPE=${1:-patch}

if [ "$UPDATE_TYPE" != "patch" ] && [ "$UPDATE_TYPE" != "minor" ] && [ "$UPDATE_TYPE" != "major" ]; then
    error "Type de mise à jour invalide. Utilisez: patch, minor, ou major"
    exit 1
fi

# Calculer la nouvelle version
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

case $UPDATE_TYPE in
    "major")
        NEW_VERSION="$((MAJOR + 1)).0.0"
        ;;
    "minor")
        NEW_VERSION="$MAJOR.$((MINOR + 1)).0"
        ;;
    "patch")
        NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))"
        ;;
esac

log "Nouvelle version: $NEW_VERSION"

# Confirmation
read -p "Confirmer la mise à jour vers la version $NEW_VERSION? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    warning "Mise à jour annulée"
    exit 0
fi

# Mettre à jour package.json
log "Mise à jour de package.json..."
sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
rm package.json.bak

# Mettre à jour version.ts
log "Mise à jour de src/lib/version.ts..."
sed -i.bak "s/export const APP_VERSION = '$CURRENT_VERSION';/export const APP_VERSION = '$NEW_VERSION';/" src/lib/version.ts
rm src/lib/version.ts.bak

# Ajouter une entrée au CHANGELOG
log "Ajout d'une entrée au CHANGELOG..."
TODAY=$(date +%Y-%m-%d)
CHANGELOG_ENTRY="## [$NEW_VERSION] - $TODAY

### 🚀 Nouvelles fonctionnalités
- À définir

### 🔧 Améliorations
- À définir

### 🐛 Corrections
- À définir

---

"

# Insérer la nouvelle entrée après le titre
sed -i.bak "2a\\
$CHANGELOG_ENTRY" CHANGELOG.md
rm CHANGELOG.md.bak

# Commit des changements
log "Commit des changements..."
git add package.json src/lib/version.ts CHANGELOG.md
git commit -m "📦 Mise à jour vers la version $NEW_VERSION

- Version package.json: $CURRENT_VERSION → $NEW_VERSION
- Mise à jour version.ts
- Ajout entrée CHANGELOG.md

Type de mise à jour: $UPDATE_TYPE"

# Push vers GitHub
log "Push vers GitHub..."
git push origin main

success "Mise à jour vers la version $NEW_VERSION terminée!"
log "Changements commités et poussés vers GitHub"
log "N'oubliez pas de mettre à jour le CHANGELOG.md avec les détails des changements"

# Afficher les prochaines étapes
echo
warning "Prochaines étapes:"
echo "1. Mettre à jour le CHANGELOG.md avec les détails des changements"
echo "2. Tester l'application localement: npm run dev"
echo "3. Vérifier le déploiement Vercel"
echo "4. Créer un tag Git: git tag v$NEW_VERSION && git push origin v$NEW_VERSION"



