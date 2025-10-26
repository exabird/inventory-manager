#!/usr/bin/env python3
"""
Script simple pour remplacer UNIQUEMENT la 2ème occurrence de handleUnifiedAIFetch
dans ProductInspector.tsx par la version améliorée
"""

# Lire le backup propre
with open('src/components/inventory/ProductInspector.tsx.backup', 'r') as f:
    lines = f.readlines()

# Lire la version améliorée
with open('handleUnifiedAIFetch-improved.txt', 'r') as f:
    improved_lines = f.readlines()

# Ajouter commentaire et espacement
improved_with_header = [
    '\n',
    '  /**\n',
    '   * Fonction unifiée pour le fetch IA (VERSION AMÉLIORÉE)\n',
    '   * Gère métadonnées + images avec classification\n',
    '   * Remplit UNIQUEMENT les champs vides\n',
    '   */\n'
] + improved_lines

# Trouver les deux occurrences de handleUnifiedAIFetch
occurrences = []
for i, line in enumerate(lines):
    if 'const handleUnifiedAIFetch = async (mode: AIFetchMode) => {' in line:
        occurrences.append(i)

if len(occurrences) < 2:
    print(f"❌ Erreur: seulement {len(occurrences)} occurrence(s) trouvée(s)")
    exit(1)

print(f"✅ Occurrences trouvées aux lignes: {occurrences}")

# Trouver la fin de la 2ème occurrence (ligne 1446)
second_start = occurrences[1] - 4  # Inclure le commentaire avant
second_func_start = occurrences[1]
brace_count = 0
second_end = None

for j in range(second_func_start, len(lines)):
    if '{' in lines[j]:
        brace_count += lines[j].count('{')
    if '}' in lines[j]:
        brace_count -= lines[j].count('}')
    if brace_count == 0 and '};' in lines[j]:
        second_end = j + 1
        break

print(f"✅ 2ème occurrence: lignes {second_start+1} à {second_end} (Python indices {second_start}-{second_end})")

# Remplacer
new_lines = lines[:second_start] + improved_with_header + lines[second_end:]

# Écrire
with open('src/components/inventory/ProductInspector.tsx', 'w') as f:
    f.writelines(new_lines)

print(f"\n✅ Remplacement terminé!")
print(f"Lignes avant: {len(lines)}")
print(f"Lignes après: {len(new_lines)}")
print(f"Différence: {len(new_lines) - len(lines)}")

