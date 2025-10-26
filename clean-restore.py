#!/usr/bin/env python3
"""
Restauration propre de ProductInspector.tsx:
1. Prendre le backup propre
2. Supprimer TOUT entre validateForm() et handleAIFillMetasOnly()
3. Insérer la version améliorée de handleUnifiedAIFetch
"""

# Lire le backup propre
with open('src/components/inventory/ProductInspector.tsx.backup', 'r') as f:
    lines = f.readlines()

# Lire la version améliorée
with open('handleUnifiedAIFetch-improved.txt', 'r') as f:
    improved_lines = f.readlines()

# Ajouter header
improved_with_header = [
    '\n',
    '  /**\n',
    '   * Fonction unifiée pour le fetch IA (VERSION AMÉLIORÉE)\n',
    '   * Gère métadonnées + images avec classification\n',
    '   * Remplit UNIQUEMENT les champs vides\n',
    '   */\n'
] + improved_lines

# Trouver validateForm (fin vers ligne 569)
validate_end = None
for i, line in enumerate(lines):
    if 'setValidationErrors(errors);' in line and 'return Object.keys(errors).length === 0;' in lines[i+1]:
        validate_end = i + 3  # Après le };
        break

# Trouver handleAIFillMetasOnly (début vers ligne 955)
ai_fill_metas_start = None
for i, line in enumerate(lines):
    if 'const handleAIFillMetasOnly = async () => {' in line:
        ai_fill_metas_start = i - 4  # Inclure le commentaire
        break

if not validate_end or not ai_fill_metas_start:
    print(f"❌ Erreur: validate_end={validate_end}, ai_fill_metas_start={ai_fill_metas_start}")
    exit(1)

print(f"✅ validateForm se termine ligne {validate_end+1}")
print(f"✅ handleAIFillMetasOnly commence ligne {ai_fill_metas_start+1}")
print(f"✅ Suppression de {ai_fill_metas_start - validate_end} lignes entre les deux")

# Construire le nouveau fichier
new_lines = lines[:validate_end] + improved_with_header + lines[ai_fill_metas_start:]

# Écrire
with open('src/components/inventory/ProductInspector.tsx', 'w') as f:
    f.writelines(new_lines)

print(f"\n✅ Restauration terminée!")
print(f"Lignes avant: {len(lines)}")
print(f"Lignes après: {len(new_lines)}")
print(f"Différence: {len(new_lines) - len(lines)}")

# Vérifier accolades
content = ''.join(new_lines)
open_braces = content.count('{')
close_braces = content.count('}')
print(f"\n📊 Accolades: {open_braces} vs {close_braces} (diff: {open_braces - close_braces})")

