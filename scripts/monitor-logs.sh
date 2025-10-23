#!/bin/bash

# =====================================================
# SURVEILLANCE CONTINUE DES LOGS - INVENTORY MANAGER
# =====================================================
# Script pour surveiller les logs Next.js en temps réel
# et corriger automatiquement les erreurs courantes

PROJECT_DIR="/Users/anthony/Cursor/Inventor AI/inventory-app"
LOG_FILE="$PROJECT_DIR/dev.log"
ERROR_LOG="$PROJECT_DIR/error.log"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Surveillance des logs Next.js démarrée...${NC}"
echo -e "${YELLOW}📁 Projet: $PROJECT_DIR${NC}"
echo -e "${YELLOW}📝 Logs: $LOG_FILE${NC}"
echo ""

# Fonction pour corriger les erreurs courantes
fix_common_errors() {
    local error="$1"
    
    case "$error" in
        *"supabaseKey is required"*)
            echo -e "${RED}❌ Erreur Supabase détectée${NC}"
            echo -e "${YELLOW}🔧 Solution: Vérifiez SUPABASE_SERVICE_ROLE_KEY dans .env.local${NC}"
            ;;
        *"Cannot find module"*)
            echo -e "${RED}❌ Module manquant détecté${NC}"
            echo -e "${YELLOW}🔧 Solution: npm install ou vérifiez les imports${NC}"
            ;;
        *"TypeError"*)
            echo -e "${RED}❌ Erreur TypeScript détectée${NC}"
            echo -e "${YELLOW}🔧 Solution: Vérifiez les types et interfaces${NC}"
            ;;
        *"Hydration failed"*)
            echo -e "${RED}❌ Erreur d'hydratation détectée${NC}"
            echo -e "${YELLOW}🔧 Solution: Vérifiez les différences client/serveur${NC}"
            ;;
    esac
}

# Fonction pour surveiller les logs
monitor_logs() {
    echo -e "${GREEN}✅ Surveillance active - Appuyez sur Ctrl+C pour arrêter${NC}"
    echo ""
    
    # Surveiller le fichier de log en temps réel
    tail -f "$LOG_FILE" 2>/dev/null | while read line; do
        # Détecter les erreurs
        if echo "$line" | grep -qi "error\|failed\|exception\|TypeError\|ReferenceError"; then
            echo -e "${RED}🚨 ERREUR DÉTECTÉE:${NC} $line"
            echo "$(date): $line" >> "$ERROR_LOG"
            fix_common_errors "$line"
            echo ""
        elif echo "$line" | grep -qi "ready\|compiled\|success"; then
            echo -e "${GREEN}✅ $line${NC}"
        elif echo "$line" | grep -qi "warning"; then
            echo -e "${YELLOW}⚠️  $line${NC}"
        else
            echo "$line"
        fi
    done
}

# Fonction pour vérifier l'état du serveur
check_server_status() {
    if lsof -ti:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Serveur Next.js actif sur le port 3000${NC}"
        return 0
    else
        echo -e "${RED}❌ Aucun serveur sur le port 3000${NC}"
        return 1
    fi
}

# Fonction pour démarrer le serveur si nécessaire
start_server_if_needed() {
    if ! check_server_status; then
        echo -e "${YELLOW}🚀 Démarrage du serveur Next.js...${NC}"
        cd "$PROJECT_DIR"
        npm run dev > "$LOG_FILE" 2>&1 &
        SERVER_PID=$!
        echo $SERVER_PID > "$PROJECT_DIR/server.pid"
        sleep 3
        check_server_status
    fi
}

# Fonction pour tester l'application
test_application() {
    echo -e "${BLUE}🧪 Test de l'application...${NC}"
    
    # Test HTTP
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        echo -e "${GREEN}✅ HTTP 200 - Application accessible${NC}"
    else
        echo -e "${RED}❌ Application non accessible${NC}"
    fi
    
    # Test des variables d'environnement
    if [ -f "$PROJECT_DIR/.env.local" ]; then
        if grep -q "NEXT_PUBLIC_SUPABASE_URL" "$PROJECT_DIR/.env.local"; then
            echo -e "${GREEN}✅ Variables Supabase configurées${NC}"
        else
            echo -e "${RED}❌ Variables Supabase manquantes${NC}"
        fi
    else
        echo -e "${RED}❌ Fichier .env.local manquant${NC}"
    fi
}

# Fonction principale
main() {
    # Créer le répertoire de logs s'il n'existe pas
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Vérifier l'état initial
    echo -e "${BLUE}🔍 Vérification de l'état initial...${NC}"
    check_server_status
    test_application
    echo ""
    
    # Démarrer le serveur si nécessaire
    start_server_if_needed
    
    # Commencer la surveillance
    monitor_logs
}

# Gestion des signaux pour arrêter proprement
trap 'echo -e "\n${YELLOW}🛑 Arrêt de la surveillance...${NC}"; exit 0' INT TERM

# Lancer le script principal
main




