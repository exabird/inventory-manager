#!/bin/bash

##############################################################################
# SCRIPT DE TEST RAPIDE - INVENTORY MANAGER
##############################################################################
#
# Ce script teste rapidement toutes les fonctionnalités principales de l'app
# 
# Usage:
#   chmod +x test-app.sh
#   ./test-app.sh
#
##############################################################################

# Codes couleur
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Compteurs
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

##############################################################################
# FONCTIONS UTILITAIRES
##############################################################################

print_header() {
    echo ""
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}  $1${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${BOLD}${BLUE}▶ $1${NC}"
    echo -e "${BLUE}───────────────────────────────────────────────────────────${NC}"
}

print_test() {
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -en "  ${YELLOW}⏳${NC} $1... "
}

print_success() {
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

##############################################################################
# TESTS
##############################################################################

# Test 1: Vérifier que Node.js est installé
test_node() {
    print_test "Vérification Node.js"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_success "Node.js installé ($NODE_VERSION)"
    else
        print_error "Node.js n'est pas installé"
        return 1
    fi
}

# Test 2: Vérifier que npm est installé
test_npm() {
    print_test "Vérification npm"
    
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        print_success "npm installé ($NPM_VERSION)"
    else
        print_error "npm n'est pas installé"
        return 1
    fi
}

# Test 3: Vérifier que les dépendances sont installées
test_dependencies() {
    print_test "Vérification des dépendances"
    
    if [ -d "node_modules" ]; then
        print_success "Dépendances installées"
    else
        print_error "Dépendances manquantes (exécutez 'npm install')"
        return 1
    fi
}

# Test 4: Vérifier les variables d'environnement
test_env() {
    print_test "Vérification des variables d'environnement"
    
    if [ -f ".env.local" ]; then
        # Vérifier les clés Supabase
        if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && \
           grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
            print_success "Variables d'environnement configurées"
        else
            print_warning "Fichier .env.local existe mais semble incomplet"
            return 1
        fi
    else
        print_warning "Fichier .env.local manquant (utilisera les valeurs par défaut)"
    fi
}

# Test 5: Vérifier la compilation TypeScript
test_typescript() {
    print_test "Compilation TypeScript"
    
    if npm run type-check > /dev/null 2>&1; then
        print_success "Pas d'erreurs TypeScript"
    else
        print_error "Erreurs TypeScript détectées"
        echo -e "${CYAN}      Exécutez 'npm run type-check' pour voir les détails${NC}"
        return 1
    fi
}

# Test 6: Vérifier le linting
test_lint() {
    print_test "Vérification du code (lint)"
    
    if npm run lint > /dev/null 2>&1; then
        print_success "Pas d'erreurs de linting"
    else
        print_warning "Erreurs de linting détectées"
        echo -e "${CYAN}      Exécutez 'npm run lint' pour voir les détails${NC}"
    fi
}

# Test 7: Vérifier le build
test_build() {
    print_test "Build de production"
    
    # Supprimer l'ancien build
    rm -rf .next
    
    if npm run build > /dev/null 2>&1; then
        print_success "Build réussi"
        rm -rf .next # Nettoyer après le test
    else
        print_error "Échec du build"
        echo -e "${CYAN}      Exécutez 'npm run build' pour voir les détails${NC}"
        return 1
    fi
}

# Test 8: Vérifier que le serveur démarre
test_server() {
    print_test "Démarrage du serveur de développement"
    
    # Vérifier si le serveur est déjà en cours
    if lsof -Pi :3000 -sTCP:LISTEN -t > /dev/null 2>&1; then
        print_success "Serveur déjà en cours d'exécution sur le port 3000"
    else
        print_info "Le serveur n'est pas en cours. Testez manuellement avec 'npm run dev'"
    fi
}

# Test 9: Vérifier la structure des fichiers
test_structure() {
    print_test "Vérification de la structure des fichiers"
    
    REQUIRED_FILES=(
        "package.json"
        "next.config.ts"
        "tsconfig.json"
        "src/app/page.tsx"
        "src/lib/supabase.ts"
        "src/lib/services.ts"
        "docs/DEBUGGING_GUIDE.md"
        "docs/ARCHITECTURE_GUIDE.md"
    )
    
    ALL_EXIST=true
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Fichier manquant: $file"
            ALL_EXIST=false
        fi
    done
    
    if $ALL_EXIST; then
        print_success "Tous les fichiers requis sont présents"
    else
        return 1
    fi
}

# Test 10: Vérifier la version
test_version() {
    print_test "Vérification de la version"
    
    if [ -f "src/lib/version.ts" ]; then
        VERSION=$(grep "APP_VERSION" src/lib/version.ts | sed 's/.*"\(.*\)".*/\1/')
        print_success "Version actuelle: $VERSION"
    else
        print_warning "Fichier version.ts manquant"
    fi
}

# Test 11: Vérifier la documentation
test_documentation() {
    print_test "Vérification de la documentation"
    
    REQUIRED_DOCS=(
        "docs/DEBUGGING_GUIDE.md"
        "docs/ARCHITECTURE_GUIDE.md"
        "docs/APPLICATION_DOCUMENTATION.md"
        "docs/DEVELOPMENT_PROCESSES.md"
        "README.md"
        "CHANGELOG.md"
    )
    
    ALL_EXIST=true
    for doc in "${REQUIRED_DOCS[@]}"; do
        if [ ! -f "$doc" ]; then
            print_warning "Documentation manquante: $doc"
            ALL_EXIST=false
        fi
    done
    
    if $ALL_EXIST; then
        print_success "Documentation complète"
    fi
}

# Test 12: Tester la connexion au serveur local
test_http_connection() {
    print_test "Test de connexion HTTP (localhost:3000)"
    
    if lsof -Pi :3000 -sTCP:LISTEN -t > /dev/null 2>&1; then
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
            print_success "Serveur répond correctement"
        else
            print_warning "Serveur en cours mais ne répond pas correctement"
        fi
    else
        print_info "Serveur non démarré (démarrez avec 'npm run dev')"
    fi
}

##############################################################################
# EXÉCUTION DES TESTS
##############################################################################

print_header "🧪 TEST AUTOMATIQUE - INVENTORY MANAGER"

print_info "Lancement de la suite de tests..."
echo ""

print_section "1. ENVIRONNEMENT"
test_node
test_npm
test_dependencies
test_env

print_section "2. CODE & COMPILATION"
test_structure
test_version
test_typescript
test_lint

print_section "3. BUILD & SERVEUR"
test_build
test_server
test_http_connection

print_section "4. DOCUMENTATION"
test_documentation

##############################################################################
# RÉSUMÉ
##############################################################################

print_header "📊 RÉSUMÉ DES TESTS"

echo -e "Tests exécutés : ${BOLD}$TESTS_TOTAL${NC}"
echo -e "Tests réussis  : ${GREEN}${BOLD}$TESTS_PASSED${NC}"
echo -e "Tests échoués  : ${RED}${BOLD}$TESTS_FAILED${NC}"
echo ""

# Calculer le pourcentage de réussite
if [ $TESTS_TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((TESTS_PASSED * 100 / TESTS_TOTAL))
    
    if [ $SUCCESS_RATE -eq 100 ]; then
        echo -e "${GREEN}${BOLD}✓ Tous les tests sont passés! (100%)${NC}"
        echo -e "${GREEN}L'application est prête à être utilisée.${NC}"
        EXIT_CODE=0
    elif [ $SUCCESS_RATE -ge 80 ]; then
        echo -e "${YELLOW}${BOLD}⚠ Quelques tests ont échoué (${SUCCESS_RATE}%)${NC}"
        echo -e "${YELLOW}L'application devrait fonctionner mais vérifiez les warnings.${NC}"
        EXIT_CODE=0
    else
        echo -e "${RED}${BOLD}✗ Plusieurs tests ont échoué (${SUCCESS_RATE}%)${NC}"
        echo -e "${RED}Corrigez les erreurs avant de continuer.${NC}"
        EXIT_CODE=1
    fi
else
    echo -e "${RED}Aucun test exécuté${NC}"
    EXIT_CODE=1
fi

echo ""
print_info "Pour plus de détails, consultez:"
echo -e "  ${CYAN}• docs/DEBUGGING_GUIDE.md${NC}"
echo -e "  ${CYAN}• docs/ARCHITECTURE_GUIDE.md${NC}"
echo ""

exit $EXIT_CODE

