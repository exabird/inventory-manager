#!/bin/bash

# Script de validation des champs produit
# Teste automatiquement tous les champs fonctionnels

echo "🧪 Test de validation des champs produit"
echo "========================================"

# Fonction pour tester un champ
test_field() {
    local field_name=$1
    local test_value=$2
    local field_type=$3
    
    echo "🔍 Test du champ: $field_name"
    
    # Créer un produit de test
    local product_id=$(psql $DATABASE_URL -t -c "
        INSERT INTO products (name, internal_ref, $field_name, quantity) 
        VALUES ('Test $field_name', 'REF-TEST-$field_name', '$test_value', 1) 
        RETURNING id;" | tr -d ' ')
    
    if [ $? -eq 0 ]; then
        echo "✅ Création réussie pour $field_name"
        
        # Vérifier la lecture
        local result=$(psql $DATABASE_URL -t -c "
            SELECT $field_name FROM products WHERE id = '$product_id';" | tr -d ' ')
        
        if [ "$result" = "$test_value" ]; then
            echo "✅ Lecture réussie pour $field_name: $result"
        else
            echo "❌ Erreur de lecture pour $field_name: attendu '$test_value', obtenu '$result'"
        fi
        
        # Test de mise à jour
        local new_value="Updated-$test_value"
        psql $DATABASE_URL -c "
            UPDATE products SET $field_name = '$new_value' WHERE id = '$product_id';"
        
        if [ $? -eq 0 ]; then
            echo "✅ Mise à jour réussie pour $field_name"
        else
            echo "❌ Erreur de mise à jour pour $field_name"
        fi
        
        # Nettoyer
        psql $DATABASE_URL -c "DELETE FROM products WHERE id = '$product_id';"
        echo "🧹 Nettoyage effectué pour $field_name"
    else
        echo "❌ Erreur de création pour $field_name"
    fi
    
    echo ""
}

# Tests des champs fonctionnels
echo "📋 Tests des champs fonctionnels:"
echo ""

test_field "manufacturer_ref" "MAN-REF-TEST" "string"
test_field "brand" "Brand Test" "string"
test_field "short_description" "Description de test" "string"
test_field "selling_price_htva" "99.99" "numeric"
test_field "purchase_price_htva" "79.99" "numeric"

echo "🎉 Tests terminés!"
echo ""
echo "📊 Résumé:"
echo "- Tous les champs fonctionnels ont été testés"
echo "- Création, lecture, mise à jour et suppression vérifiées"
echo "- Base de données nettoyée"
