#!/bin/bash

echo "🔍 Monitoring Next.js logs..."
echo "Appuyez sur Ctrl+C pour arrêter"
echo ""

# Monitor les logs Next.js
tail -f /dev/null 2>&1 | while read line; do
  echo "$(date '+%H:%M:%S') - $line"
done &

# Monitor les erreurs dans les logs
while true; do
  if curl -s "http://localhost:3000" | grep -q "error\|Error\|ERROR"; then
    echo "❌ Erreur détectée dans l'application"
    curl -s "http://localhost:3000" | grep -o "error\|Error\|ERROR" | head -3
  fi
  sleep 5
done
