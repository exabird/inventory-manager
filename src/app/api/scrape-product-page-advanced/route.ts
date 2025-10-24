/**
 * API pour scraper une page produit avec Puppeteer (JavaScript enabled)
 * Gère les onglets dynamiques, lazy loading, et images en JavaScript
 * Compatible Vercel avec @sparticuz/chromium
 */

import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const runtime = 'nodejs'; // ⚠️ Puppeteer nécessite Node.js runtime

export const maxDuration = 60; // 60 secondes max

interface ScrapedContent {
  html: string;
  images: string[];
  title: string;
  sections: Array<{ title: string; content: string }>;
}

export async function POST(request: NextRequest) {
  let browser = null;
  
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL requise' }, { status: 400 });
    }

    console.log('🌐 [Scraper Advanced] Début scraping avec Puppeteer de:', url);

    // Déterminer si on est sur Vercel ou en local
    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    
    console.log('🔍 [Scraper Advanced] Environnement:', isProduction ? 'Vercel/Production' : 'Local');

    // Lancer le navigateur headless (avec Chromium sur Vercel)
    if (isProduction) {
      // Configuration pour Vercel avec @sparticuz/chromium
      browser = await puppeteer.launch({
        args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
        defaultViewport: { width: 1920, height: 1080 },
        executablePath: await chromium.executablePath(),
        headless: true,
      });
      console.log('✅ [Scraper Advanced] Chromium lancé (Vercel)');
    } else {
      // Configuration pour développement local avec Puppeteer classique
      const puppeteerLocal = await import('puppeteer');
      browser = await puppeteerLocal.default.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ]
      });
      console.log('✅ [Scraper Advanced] Puppeteer lancé (Local)');
    }

    const page = await browser.newPage();

    // Définir le viewport et user-agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('📄 [Scraper Advanced] Navigation vers la page...');

    // Naviguer vers la page avec plusieurs stratégies d'attente
    await page.goto(url, {
      waitUntil: ['load', 'domcontentloaded', 'networkidle0'], // Attendre plusieurs événements
      timeout: 45000
    });

    console.log('✅ [Scraper Advanced] Page chargée, attente du contenu JavaScript...');
    
    // Attendre un peu plus longtemps pour que le JavaScript s'exécute
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 secondes

    // Détecter si l'URL contient un hash (ex: #marketing-images)
    const urlHash = url.includes('#') ? url.split('#')[1] : null;
    
    if (urlHash) {
      console.log('🔗 [Scraper Advanced] Hash détecté:', urlHash);
      
      // Chercher et cliquer sur l'onglet correspondant
      const tabClicked = await page.evaluate((hash) => {
        // Chercher les onglets/boutons qui pourraient correspondre
        const possibleSelectors = [
          `a[href*="${hash}"]`,
          `button[data-tab="${hash}"]`,
          `[role="tab"][aria-controls*="${hash}"]`,
          `button:contains("${hash.replace(/-/g, ' ')}")`, // Ex: marketing-images → "marketing images"
        ];
        
        for (const selector of possibleSelectors) {
          try {
            const element = document.querySelector(selector) as HTMLElement;
            if (element) {
              console.log('🖱️ Clic sur onglet:', selector);
              element.click();
              return true;
            }
          } catch (e) {
            // Ignore, essaie le prochain sélecteur
          }
        }
        
        return false;
      }, urlHash);
      
      if (tabClicked) {
        console.log('✅ [Scraper Advanced] Onglet cliqué, attente du chargement...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log('⚠️ [Scraper Advanced] Onglet non trouvé, scraping de la page entière');
      }
    }

    // Attendre que les images se chargent (lazy loading)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Scroller pour déclencher le lazy loading des images
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    console.log('🖼️ [Scraper Advanced] Extraction des images...');

    // Extraire toutes les images visibles
    const images = await page.evaluate(() => {
      const imageUrls = new Set<string>();
      
      // Sélectionner toutes les images et pictures
      const imgElements = document.querySelectorAll('img, picture source');
      
      imgElements.forEach(elem => {
        // Chercher l'URL dans tous les attributs possibles
        let src = (elem as HTMLImageElement).src 
          || elem.getAttribute('data-src') 
          || elem.getAttribute('data-lazy-src')
          || elem.getAttribute('data-srcset')?.split(',')[0]?.split(' ')[0]
          || elem.getAttribute('srcset')?.split(',')[0]?.split(' ')[0]
          || '';
        
        // Si l'URL est vide ou invalide, passer
        if (!src || src === window.location.href) {
          return;
        }
        
        // Convertir les URLs relatives en absolues
        if (src && !src.startsWith('http')) {
          try {
            src = new URL(src, window.location.origin).href;
          } catch (e) {
            return; // URL invalide
          }
        }
        
        if (src && src.startsWith('http') && src.length > 20) { // URL complète avec au moins 20 caractères
          // Filtrer les petites images (icônes, logos)
          const width = (elem as HTMLImageElement).naturalWidth || parseInt(elem.getAttribute('width') || '0');
          const height = (elem as HTMLImageElement).naturalHeight || parseInt(elem.getAttribute('height') || '0');
          const alt = elem.getAttribute('alt') || '';
          
          // Accepter si :
          // - Dimensions > 100px OU
          // - Pas de dimensions définies OU
          // - Alt contient des mots-clés produit
          const isProductImage =
            (width > 100 || height > 100 || (!width && !height)) &&
            !src.includes('icon') &&
            !src.includes('logo') &&
            !src.includes('sprite') &&
            !alt.toLowerCase().includes('logo');
          
          if (isProductImage) {
            imageUrls.add(src); // Garder l'URL complète avec paramètres (important pour CDN)
          }
        }
      });
      
      return Array.from(imageUrls);
    });

    console.log('🖼️ [Scraper Advanced] Images trouvées:', images.length);

    if (images.length > 0) {
      console.log('🖼️ [Scraper Advanced] Première image:', images[0]);
      console.log('🖼️ [Scraper Advanced] Dernière image:', images[images.length - 1]);
    }

    // Extraire le titre de la page
    const pageTitle = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const title = document.querySelector('title');
      return h1?.textContent?.trim() || title?.textContent?.trim() || '';
    });

    console.log('📄 [Scraper Advanced] Titre de la page:', pageTitle);

    // Extraire le contenu HTML principal
    const html = await page.evaluate(() => {
      const main = document.querySelector('main') || document.querySelector('article') || document.body;
      return main.innerHTML;
    });

    console.log('✅ [Scraper Advanced] HTML extrait, taille:', html.length, 'caractères');

    // Fermer le navigateur
    await browser.close();
    browser = null;

    const result: ScrapedContent = {
      html: html,
      images: images,
      title: pageTitle,
      sections: [] // Non implémenté pour le moment
    };

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ [Scraper Advanced] Erreur:', error.message);
    
    // Fermer le navigateur en cas d'erreur
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('❌ [Scraper Advanced] Erreur fermeture navigateur:', e);
      }
    }
    
    return NextResponse.json(
      {
        error: 'Erreur lors du scraping',
        details: error.message
      },
      { status: 500 }
    );
  }
}

