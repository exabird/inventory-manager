/**
 * API pour télécharger des images depuis URLs externes
 * et les uploader dans Supabase Storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ProductImageService } from '@/lib/productImageService';
import sharp from 'sharp';

export const runtime = 'nodejs'; // Pour gérer les buffers et sharp

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DownloadedImage {
  originalUrl: string;
  supabaseUrl: string;
  fileName: string;
  success: boolean;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrls, productId } = body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ error: 'URLs d\'images requises' }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json({ error: 'ID produit requis' }, { status: 400 });
    }

    console.log('📥 [Download Images] Début téléchargement de', imageUrls.length, 'images');
    console.log('🆔 [Download Images] Produit ID:', productId);

    const results: DownloadedImage[] = [];

    // Télécharger et uploader chaque image
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      
      try {
        // ⚠️ Ignorer les URLs data:, SVG inline, et GIF placeholders
        if (imageUrl.startsWith('data:')) {
          console.warn(`⚠️ [Download Images] Ignoré (data:image): ${imageUrl.substring(0, 50)}...`);
          continue;
        }
        
        if (imageUrl.includes('.svg') || imageUrl.includes('svg+xml')) {
          console.warn(`⚠️ [Download Images] Ignoré (SVG): ${imageUrl}`);
          continue;
        }
        
        console.log(`📥 [Download Images] Image ${i+1}/${imageUrls.length}: ${imageUrl}`);

        // Télécharger l'image depuis l'URL externe
        const imageResponse = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        });

        if (!imageResponse.ok) {
          throw new Error(`HTTP ${imageResponse.status}`);
        }

        // Récupérer le contenu de l'image
        const arrayBuffer = await imageResponse.arrayBuffer();
        let buffer = Buffer.from(arrayBuffer);

        // Déterminer le type d'image source
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
        
        // ⚠️ AVIF n'est pas supporté par Supabase
        if (contentType.includes('avif')) {
          console.warn(`⚠️ [Download Images] AVIF détecté pour: ${imageUrl}`);
          throw new Error('Format AVIF non supporté par Supabase Storage');
        }

        // 🎨 Traiter l'image avec sharp pour convertir PNG transparent → JPG fond blanc
        let finalBuffer: Buffer;
        let extension = 'jpg';
        let finalContentType = 'image/jpeg';

        try {
          const image = sharp(buffer);
          const metadata = await image.metadata();

          console.log(`📊 [Download Images] Format source: ${metadata.format}, Canaux: ${metadata.channels}, Alpha: ${metadata.hasAlpha}`);

          // Rejeter les images trop petites (probablement des icônes/placeholders)
          if (metadata.width && metadata.height && (metadata.width < 50 || metadata.height < 50)) {
            console.warn(`⚠️ [Download Images] Image trop petite (${metadata.width}x${metadata.height}), ignorée`);
            throw new Error('Image trop petite');
          }

          // Si PNG avec transparence (alpha channel), convertir en JPG avec fond blanc
          if (metadata.format === 'png' && metadata.hasAlpha) {
            console.log('🎨 [Download Images] PNG transparent détecté → Conversion en JPG avec fond blanc');
            finalBuffer = await image
              .flatten({ background: { r: 255, g: 255, b: 255 } }) // Fond blanc
              .jpeg({ quality: 90 })
              .toBuffer();
          } 
          // Si WEBP, convertir en JPG
          else if (metadata.format === 'webp') {
            console.log('🔄 [Download Images] WEBP détecté → Conversion en JPG');
            finalBuffer = await image
              .jpeg({ quality: 90 })
              .toBuffer();
          }
          // Si déjà JPEG, optimiser
          else if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
            console.log('✅ [Download Images] JPEG détecté, optimisation légère');
            finalBuffer = await image
              .jpeg({ quality: 90 })
              .toBuffer();
          }
          // Autres formats (GIF, etc.) → convertir en JPEG
          else {
            console.log(`🔄 [Download Images] Format ${metadata.format} détecté → Conversion en JPG`);
            finalBuffer = await image
              .flatten({ background: { r: 255, g: 255, b: 255 } }) // Fond blanc au cas où
              .jpeg({ quality: 90 })
              .toBuffer();
          }
          
          // Vérifier que le buffer final n'est pas vide
          if (!finalBuffer || finalBuffer.length === 0) {
            throw new Error('Buffer final vide après traitement sharp');
          }
        } catch (sharpError: any) {
          console.error('❌ [Download Images] Erreur critique sharp:', sharpError.message);
          console.error('❌ [Download Images] Cette image sera ignorée pour éviter les problèmes');
          throw sharpError; // Propager l'erreur pour ignorer cette image
        }

        // Générer un nom de fichier unique
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const fileName = `${productId}_${timestamp}_${i}_${random}.${extension}`;
        const filePath = `products/${fileName}`;

        console.log(`💾 [Download Images] Upload vers Supabase: ${filePath}`);

        // Upload vers Supabase Storage (avec le buffer traité)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, finalBuffer, {
            contentType: finalContentType,
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        // Récupérer l'URL publique
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        const supabaseUrl = publicUrlData.publicUrl;

        console.log(`✅ [Download Images] Image ${i+1} uploadée: ${supabaseUrl}`);

        // Enregistrer l'image dans la table product_images
        try {
          // Vérifier s'il y a déjà des images pour ce produit
          const existingImages = await ProductImageService.getByProductId(productId);
          const hasFeatured = existingImages.some(img => img.is_featured);
          
          const imageRecord = await ProductImageService.create({
            product_id: productId,
            url: supabaseUrl,
            storage_path: filePath,
            file_name: fileName,
            is_featured: !hasFeatured && i === 0 // Seulement si aucune image featured n'existe
          });
          
          console.log(`✅ [Download Images] Image ${i+1} enregistrée en BDD:`, imageRecord?.id);
        } catch (dbError: any) {
          console.error(`❌ [Download Images] Erreur BDD pour image ${i+1}:`, dbError.message);
          console.error(`❌ [Download Images] Stack:`, dbError.stack);
        }

        results.push({
          originalUrl: imageUrl,
          supabaseUrl: supabaseUrl,
          fileName: fileName,
          success: true
        });

      } catch (error: any) {
        console.error(`❌ [Download Images] Erreur image ${i+1}:`, error.message);
        results.push({
          originalUrl: imageUrl,
          supabaseUrl: '',
          fileName: '',
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ [Download Images] Terminé: ${successCount}/${imageUrls.length} images uploadées`);

    return NextResponse.json({
      success: true,
      results: results,
      successCount: successCount,
      totalCount: imageUrls.length
    });

  } catch (error: any) {
    console.error('❌ [Download Images] Erreur globale:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du téléchargement des images',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

