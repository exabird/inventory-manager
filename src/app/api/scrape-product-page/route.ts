/**
 * API pour scraper une page produit et extraire le contenu structuré
 * Conserve la structure HTML (titres, listes, paragraphes, images)
 */

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = 'edge';

interface ScrapedContent {
  html: string;
  images: string[];
  title: string;
  sections: Array<{ title: string; content: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL requise' }, { status: 400 });
    }

    console.log('🌐 [Scraper] Début scraping de:', url);

    // Récupérer la page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log('✅ [Scraper] Page récupérée, taille:', html.length, 'caractères');

    // Parser le HTML avec Cheerio
    const $ = cheerio.load(html);

    // Nettoyer les éléments non pertinents
    $('script, style, nav, header, footer, .cookie-banner, .newsletter, .social-share').remove();

    // Extraire le titre de la page
    const pageTitle = $('h1').first().text().trim() || $('title').text().trim();

    // Extraire toutes les images produit (pas les icônes)
    const images: string[] = [];
    const uniqueImages = new Set<string>();
    
    $('img, picture source').each((_, elem) => {
      // Chercher dans tous les attributs possibles
      let src = $(elem).attr('src') 
        || $(elem).attr('data-src') 
        || $(elem).attr('data-lazy-src')
        || $(elem).attr('data-srcset')?.split(',')[0]?.split(' ')[0]
        || $(elem).attr('srcset')?.split(',')[0]?.split(' ')[0]
        || '';
      
      // Convertir les URLs relatives en absolues
      if (src && !src.startsWith('http')) {
        try {
          const baseUrl = new URL(url);
          src = new URL(src, baseUrl.origin).href;
        } catch (e) {
          console.warn('⚠️ [Scraper] URL invalide:', src);
          return;
        }
      }
      
      // Filtrer les petites images (icônes, logos)
      const width = parseInt($(elem).attr('width') || '0');
      const height = parseInt($(elem).attr('height') || '0');
      const alt = $(elem).attr('alt') || '';
      
      // Accepter l'image si :
      // - Dimensions > 100px OU
      // - Pas de dimensions définies (prendre par défaut) OU
      // - Alt contient des mots-clés produit
      const isProductImage = 
        (width > 100 || height > 100 || (!width && !height)) &&
        !src.includes('icon') && 
        !src.includes('logo') &&
        !src.includes('sprite') &&
        !alt.toLowerCase().includes('logo');
      
      if (src && isProductImage) {
        // Ne pas modifier les URLs - elles seront traitées côté serveur
        // avec sharp pour convertir PNG transparent → JPG fond blanc
        
        // Éviter les doublons (comparer sans paramètres de requête)
        const cleanSrc = src.split('?')[0];
        if (!uniqueImages.has(cleanSrc)) {
          uniqueImages.add(cleanSrc);
          images.push(src);
        }
      }
    });

    console.log('🖼️ [Scraper] Images trouvées:', images.length);
    if (images.length > 0) {
      console.log('🖼️ [Scraper] Première image:', images[0]);
      console.log('🖼️ [Scraper] Dernière image:', images[images.length - 1]);
    }

    // Trouver le conteneur principal du produit
    const mainContent = $('main, article, .product, .product-detail, .product-page, #main-content, #content').first();
    
    if (mainContent.length === 0) {
      console.warn('⚠️ [Scraper] Conteneur principal non trouvé, utilisation du body');
    }

    const contentContainer = mainContent.length > 0 ? mainContent : $('body');

    // Construire le HTML structuré
    let structuredHTML = '';
    const sections: Array<{ title: string; content: string }> = [];

    // Parcourir les éléments du contenu
    contentContainer.find('h1, h2, h3, h4, p, ul, ol, img, div.description, div.features, div.specs').each((_, elem) => {
      const tagName = elem.tagName.toLowerCase();
      const $elem = $(elem);

      // Ignorer les éléments vides
      if ($elem.text().trim().length === 0 && tagName !== 'img') {
        return;
      }

      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
          const title = $elem.text().trim();
          if (title) {
            structuredHTML += `<${tagName}>${title}</${tagName}>\n`;
            sections.push({ title, content: '' });
          }
          break;

        case 'p':
          const text = $elem.text().trim();
          if (text && text.length > 20) { // Ignorer les très courts paragraphes
            structuredHTML += `<p>${text}</p>\n`;
          }
          break;

        case 'ul':
        case 'ol':
          structuredHTML += `<${tagName}>\n`;
          $elem.find('li').each((_, li) => {
            const liText = $(li).text().trim();
            if (liText) {
              structuredHTML += `  <li>${liText}</li>\n`;
            }
          });
          structuredHTML += `</${tagName}>\n`;
          break;

        case 'img':
          let imgSrc = $elem.attr('src') || $elem.attr('data-src') || '';
          if (imgSrc && !imgSrc.startsWith('http')) {
            const baseUrl = new URL(url);
            imgSrc = new URL(imgSrc, baseUrl.origin).href;
          }
          const alt = $elem.attr('alt') || 'Image produit';
          if (imgSrc && !imgSrc.includes('icon')) {
            structuredHTML += `<img src="${imgSrc}" alt="${alt}" />\n`;
          }
          break;

        case 'div':
          // Pour les divs avec classes spécifiques
          if ($elem.hasClass('description') || $elem.hasClass('features') || $elem.hasClass('specs')) {
            const divText = $elem.text().trim();
            if (divText && divText.length > 50) {
              structuredHTML += `<p>${divText}</p>\n`;
            }
          }
          break;
      }
    });

    console.log('✅ [Scraper] HTML structuré généré, taille:', structuredHTML.length, 'caractères');

    return NextResponse.json({
      success: true,
      data: {
        html: structuredHTML,
        images: images.slice(0, 50), // Limiter à 50 images max pour récupération complète
        title: pageTitle,
        sections: sections.slice(0, 20), // Limiter à 20 sections max
        originalUrl: url
      }
    });

  } catch (error: any) {
    console.error('❌ [Scraper] Erreur:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du scraping',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

