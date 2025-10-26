#!/usr/bin/env python3
"""
Script pour restaurer ProductInspector.tsx depuis le backup
et intégrer la fonction handleUnifiedAIFetch améliorée
"""

# Lire le backup complet
with open('src/components/inventory/ProductInspector.tsx.backup', 'r') as f:
    backup_lines = f.readlines()

# Lire la version améliorée de handleUnifiedAIFetch depuis .current-save
with open('src/components/inventory/ProductInspector.tsx.current-save', 'r') as f:
    current_lines = f.readlines()

# Extraire handleUnifiedAIFetch amélioré (lignes 444-635)
improved_function = current_lines[443:635]

# Trouver et supprimer la PREMIÈRE occurrence de handleUnifiedAIFetch dans le backup (lignes 571-600)
# Chercher "const handleUnifiedAIFetch"
first_occurrence_start = None
first_occurrence_end = None

for i, line in enumerate(backup_lines):
    if 'const handleUnifiedAIFetch = async (mode: AIFetchMode) => {' in line:
        if first_occurrence_start is None:
            first_occurrence_start = i - 4  # Inclure le commentaire
            # Trouver la fin de cette fonction (jusqu'à "};")
            brace_count = 0
            for j in range(i, len(backup_lines)):
                if '{' in backup_lines[j]:
                    brace_count += backup_lines[j].count('{')
                if '}' in backup_lines[j]:
                    brace_count -= backup_lines[j].count('}')
                if brace_count == 0 and '};' in backup_lines[j]:
                    first_occurrence_end = j + 1
                    break
            break

# Supprimer fetchMetasOnly également (si c'est après)
fetch_metas_start = None
fetch_metas_end = None

for i in range(first_occurrence_end if first_occurrence_end else 0, min(len(backup_lines), (first_occurrence_end or 0) + 100)):
    if 'const fetchMetasOnly = async () => {' in backup_lines[i]:
        fetch_metas_start = i - 4  # Inclure le commentaire
        # Trouver la fin
        brace_count = 0
        for j in range(i, len(backup_lines)):
            if '{' in backup_lines[j]:
                brace_count += backup_lines[j].count('{')
            if '}' in backup_lines[j]:
                brace_count -= backup_lines[j].count('}')
            if brace_count == 0 and '};' in backup_lines[j]:
                fetch_metas_end = j + 1
                break
        break

print(f"Première occurrence handleUnifiedAIFetch: lignes {first_occurrence_start}-{first_occurrence_end}")
print(f"fetchMetasOnly: lignes {fetch_metas_start}-{fetch_metas_end}")

# Supprimer ces lignes
if first_occurrence_start and first_occurrence_end:
    del backup_lines[first_occurrence_start:first_occurrence_end]
    # Ajuster les indices
    if fetch_metas_start:
        offset = first_occurrence_end - first_occurrence_start
        fetch_metas_start -= offset
        fetch_metas_end -= offset

if fetch_metas_start and fetch_metas_end:
    del backup_lines[fetch_metas_start:fetch_metas_end]

# Trouver la DEUXIÈME occurrence de handleUnifiedAIFetch (maintenant la seule)
second_occurrence_start = None
second_occurrence_end = None

for i, line in enumerate(backup_lines):
    if 'const handleUnifiedAIFetch = async (mode: AIFetchMode) => {' in line:
        second_occurrence_start = i - 4  # Inclure le commentaire
        # Trouver la fin
        brace_count = 0
        for j in range(i, len(backup_lines)):
            if '{' in backup_lines[j]:
                brace_count += backup_lines[j].count('{')
            if '}' in backup_lines[j]:
                brace_count -= backup_lines[j].count('}')
            if brace_count == 0 and '};' in backup_lines[j]:
                second_occurrence_end = j + 1
                break
        break

print(f"Deuxième occurrence (à remplacer): lignes {second_occurrence_start}-{second_occurrence_end}")

# Remplacer la deuxième occurrence par la version améliorée
if second_occurrence_start and second_occurrence_end:
    # Ajouter commentaire pour la fonction améliorée
    improved_with_comment = [
        '\n',
        '  /**\n',
        '   * Fonction unifiée pour le fetch IA (VERSION AMÉLIORÉE)\n',
        '   * Gère métadonnées + images avec classification\n',
        '   */\n'
    ] + improved_function
    
    backup_lines[second_occurrence_start:second_occurrence_end] = improved_with_comment

# Écrire le résultat
with open('src/components/inventory/ProductInspector.tsx', 'w') as f:
    f.writelines(backup_lines)

print(f"\n✅ Restauration terminée!")
print(f"Lignes avant: {len(open('src/components/inventory/ProductInspector.tsx.backup').readlines())}")
print(f"Lignes après: {len(backup_lines)}")

