import { NextRequest, NextResponse } from 'next/server';

// API pour OCR sur image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Convertir l'image en base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageFile.type;

    // Utiliser l'API Claude Vision pour l'OCR
    const claudeApiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY;
    
    if (!claudeApiKey) {
      return NextResponse.json({ error: 'Claude API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrait tout le texte visible dans cette image. Inclus les codes-barres, prix, noms de produits, et toute autre information textuelle.'
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: base64
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const result = await response.json();
    const extractedText = result.content[0].text;

    return NextResponse.json({
      success: true,
      text: extractedText,
      confidence: 85 // Claude Vision est très fiable
    });

  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json({
      error: 'OCR failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}




