'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, Save, Key, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [minConfidence, setMinConfidence] = useState(75);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const settings = localStorage.getItem('ai_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setClaudeApiKey(parsed.claudeApiKey || '');
      setSelectedModel(parsed.model || 'claude-3-5-sonnet-20241022');
      setMinConfidence(parsed.minConfidence || 75);
      setCustomPrompt(parsed.customPrompt || getDefaultPrompt());
    } else {
      setCustomPrompt(getDefaultPrompt());
    }
  }, []);

  // Prompt par défaut
  function getDefaultPrompt() {
    return `Tu es un expert en analyse de données produit. Ta mission est de rechercher et extraire des informations produit depuis les sites des fabricants.

Processus de recherche:
1. Identifie le fabricant/marque du produit à partir du code-barres ou nom
2. Recherche sur le site officiel du fabricant
3. Extrait les données structurées de la page produit officielle
4. Vérifie la cohérence et la logique des informations

Données à extraire:
- Nom exact du produit
- Description détaillée
- Spécifications techniques
- Prix de vente conseillé
- Dimensions et poids
- Images officielles
- Références fabricant
- Catégorie

Règles importantes:
- Priorise TOUJOURS les sites officiels des fabricants
- Vérifie la cohérence des données (prix, dimensions, etc.)
- Indique la source exacte de chaque information
- Donne un score de confiance (0-100) pour chaque champ
- Ne remplis que les champs pour lesquels tu as une source fiable`;
  }

  // Sauvegarder les paramètres
  const handleSave = () => {
    setIsSaving(true);
    
    const settings = {
      claudeApiKey,
      model: selectedModel,
      minConfidence,
      customPrompt
    };

    localStorage.setItem('ai_settings', JSON.stringify(settings));
    
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('Paramètres sauvegardés avec succès !');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 500);
  };

  // Réinitialiser le prompt
  const handleResetPrompt = () => {
    setCustomPrompt(getDefaultPrompt());
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground mt-2">
            Configurez l'intégration IA pour le scraping automatique de données produit
          </p>
        </div>

        {/* Configuration API Claude */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle>API Claude</CardTitle>
            </div>
            <CardDescription>
              Configurez votre clé API Anthropic pour l'analyse IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Clé API Claude</Label>
              <Input
                id="api-key"
                type="password"
                value={claudeApiKey}
                onChange={(e) => setClaudeApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
              />
              <p className="text-xs text-muted-foreground">
                Obtenez votre clé sur{' '}
                <a 
                  href="https://console.anthropic.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  console.anthropic.com
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modèle IA</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude-3-5-sonnet-20241022">
                    Claude 3.5 Sonnet (Recommandé)
                  </SelectItem>
                  <SelectItem value="claude-3-haiku-20240307">
                    Claude 3 Haiku (Rapide)
                  </SelectItem>
                  <SelectItem value="claude-3-opus-20240229">
                    Claude 3 Opus (Précis)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Sonnet offre le meilleur rapport qualité/prix pour le scraping
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configuration IA */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <CardTitle>Configuration IA</CardTitle>
            </div>
            <CardDescription>
              Paramètres d'analyse et de validation des données
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confidence">Confiance minimale (%)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="confidence"
                  type="number"
                  min="0"
                  max="100"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(parseInt(e.target.value) || 75)}
                  className="w-24"
                />
                <Badge variant="secondary">{minConfidence}%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Seuil minimal de confiance pour accepter les données IA
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Préprompt Personnalisé */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Préprompt de Recherche</CardTitle>
            </div>
            <CardDescription>
              Instructions données à l'IA pour la recherche et l'extraction de données
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt Système</Label>
              <Textarea
                id="prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleResetPrompt}
                  variant="outline"
                  size="sm"
                >
                  Réinitialiser
                </Button>
                <p className="text-xs text-muted-foreground flex items-center">
                  Le prompt sera amélioré au fur et à mesure des tests
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bouton Sauvegarder */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="gap-2"
          >
            <Save className="h-5 w-5" />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
          </Button>
          
          {saveMessage && (
            <Badge variant="default" className="bg-green-500">
              {saveMessage}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

