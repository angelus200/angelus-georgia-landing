/**
 * AI Property Analyzer Service
 * Uses Manus Forge API to extract property data from documents
 */

import { ENV } from './_core/env';

interface ExtractedPropertyData {
  title?: string;
  description?: string;
  longDescription?: string;
  location?: string;
  city?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  propertyType?: 'apartment' | 'house' | 'villa' | 'commercial' | 'land';
  constructionStatus?: 'planning' | 'foundation' | 'structure' | 'finishing' | 'completed';
  completionDate?: string;
  originalPrice?: number;
  pricePerSqm?: number;
  features?: string[];
  amenities?: string[];
  developerName?: string;
  expectedReturn?: number;
  rentalGuarantee?: boolean;
  rentalGuaranteePercent?: number;
  confidence?: number;
  rawExtraction?: string;
}

interface AnalysisResult {
  success: boolean;
  data?: ExtractedPropertyData;
  error?: string;
}

const FORGE_API_URL = ENV.forgeApiUrl || 'https://forge.manus.im';
const FORGE_API_KEY = ENV.forgeApiKey;

/**
 * Analyze document content and extract property data using AI
 */
export async function analyzePropertyDocument(
  documentContent: string,
  documentType: 'pdf' | 'word' | 'text' | 'image',
  additionalContext?: string
): Promise<AnalysisResult> {
  if (!FORGE_API_KEY) {
    console.error('[AI Analyzer] Forge API key not configured');
    return { success: false, error: 'AI service not configured' };
  }

  const systemPrompt = `Du bist ein Experte für Immobilienanalyse. Extrahiere alle relevanten Immobiliendaten aus dem bereitgestellten Dokument.

Extrahiere folgende Informationen (falls vorhanden):
- Titel/Name der Immobilie
- Beschreibung (kurz und lang)
- Standort/Adresse
- Stadt
- Fläche in Quadratmetern
- Anzahl Schlafzimmer
- Anzahl Badezimmer
- Baujahr oder geplantes Fertigstellungsdatum
- Immobilientyp (Wohnung, Haus, Villa, Gewerbe, Grundstück)
- Baustatus (Planung, Fundament, Rohbau, Ausbau, Fertiggestellt)
- Preis vom Bauträger
- Preis pro Quadratmeter
- Ausstattungsmerkmale
- Annehmlichkeiten
- Name des Bauträgers/Entwicklers
- Erwartete Rendite
- Mietgarantie (ja/nein und Prozentsatz)

Antworte NUR mit einem validen JSON-Objekt im folgenden Format:
{
  "title": "string oder null",
  "description": "string oder null",
  "longDescription": "string oder null",
  "location": "string oder null",
  "city": "string oder null",
  "area": number oder null,
  "bedrooms": number oder null,
  "bathrooms": number oder null,
  "yearBuilt": number oder null,
  "propertyType": "apartment" | "house" | "villa" | "commercial" | "land" | null,
  "constructionStatus": "planning" | "foundation" | "structure" | "finishing" | "completed" | null,
  "completionDate": "YYYY-MM-DD oder null",
  "originalPrice": number oder null,
  "pricePerSqm": number oder null,
  "features": ["string array"] oder [],
  "amenities": ["string array"] oder [],
  "developerName": "string oder null",
  "expectedReturn": number (als Prozent, z.B. 8.5) oder null,
  "rentalGuarantee": boolean oder null,
  "rentalGuaranteePercent": number oder null,
  "confidence": number zwischen 0 und 1
}`;

  const userPrompt = `Analysiere das folgende ${documentType === 'pdf' ? 'PDF-Dokument' : documentType === 'word' ? 'Word-Dokument' : documentType === 'image' ? 'Bild' : 'Dokument'} und extrahiere alle Immobiliendaten:

${documentContent}

${additionalContext ? `Zusätzlicher Kontext: ${additionalContext}` : ''}

Antworte NUR mit dem JSON-Objekt, ohne zusätzlichen Text.`;

  try {
    const response = await fetch(`${FORGE_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FORGE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4096,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Analyzer] API error:', response.status, errorText);
      return { success: false, error: `API error: ${response.status}` };
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return { success: false, error: 'No response from AI' };
    }

    // Parse JSON response
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { 
          success: true, 
          data: { 
            rawExtraction: content,
            confidence: 0.3 
          } 
        };
      }

      const extractedData = JSON.parse(jsonMatch[0]) as ExtractedPropertyData;
      extractedData.rawExtraction = content;
      
      return { success: true, data: extractedData };
    } catch (parseError) {
      console.error('[AI Analyzer] JSON parse error:', parseError);
      return { 
        success: true, 
        data: { 
          rawExtraction: content,
          confidence: 0.2 
        } 
      };
    }
  } catch (error) {
    console.error('[AI Analyzer] Request failed:', error);
    return { success: false, error: 'Failed to analyze document' };
  }
}

/**
 * Analyze multiple images and combine results
 */
export async function analyzePropertyImages(
  imageUrls: string[],
  additionalContext?: string
): Promise<AnalysisResult> {
  if (!FORGE_API_KEY) {
    return { success: false, error: 'AI service not configured' };
  }

  const systemPrompt = `Du bist ein Experte für Immobilienanalyse. Analysiere die bereitgestellten Bilder einer Immobilie und beschreibe was du siehst.

Identifiziere:
- Art der Räume (Schlafzimmer, Badezimmer, Küche, Wohnzimmer, etc.)
- Ausstattungsmerkmale
- Qualität und Stil der Einrichtung
- Besondere Merkmale
- Geschätzter Bauzustand

Antworte mit einem JSON-Objekt:
{
  "roomsIdentified": ["string array"],
  "features": ["string array"],
  "amenities": ["string array"],
  "qualityAssessment": "string",
  "constructionStatus": "planning" | "foundation" | "structure" | "finishing" | "completed" | null,
  "description": "string",
  "confidence": number
}`;

  try {
    // Create message content with images
    const messageContent: any[] = [
      { type: 'text', text: `Analysiere diese ${imageUrls.length} Bilder einer Immobilie:${additionalContext ? `\n\nKontext: ${additionalContext}` : ''}` }
    ];

    // Add image URLs (limit to 10 images)
    for (const url of imageUrls.slice(0, 10)) {
      messageContent.push({
        type: 'image_url',
        image_url: { url }
      });
    }

    const response = await fetch(`${FORGE_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FORGE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: messageContent }
        ],
        max_tokens: 2048,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `API error: ${response.status}` };
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return { success: false, error: 'No response from AI' };
    }

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const imageData = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          data: {
            features: imageData.features || [],
            amenities: imageData.amenities || [],
            constructionStatus: imageData.constructionStatus,
            description: imageData.description,
            bedrooms: imageData.roomsIdentified?.filter((r: string) => 
              r.toLowerCase().includes('schlafzimmer') || r.toLowerCase().includes('bedroom')
            ).length || undefined,
            bathrooms: imageData.roomsIdentified?.filter((r: string) => 
              r.toLowerCase().includes('bad') || r.toLowerCase().includes('bathroom')
            ).length || undefined,
            confidence: imageData.confidence || 0.5,
            rawExtraction: content,
          }
        };
      }
    } catch (e) {
      // Fallback
    }

    return { 
      success: true, 
      data: { rawExtraction: content, confidence: 0.3 } 
    };
  } catch (error) {
    console.error('[AI Analyzer] Image analysis failed:', error);
    return { success: false, error: 'Failed to analyze images' };
  }
}

/**
 * Combine extracted data from multiple sources
 */
export function combineExtractedData(
  documentData?: ExtractedPropertyData,
  imageData?: ExtractedPropertyData
): ExtractedPropertyData {
  const combined: ExtractedPropertyData = {};

  // Prefer document data, supplement with image data
  if (documentData) {
    Object.assign(combined, documentData);
  }

  if (imageData) {
    // Only fill in missing fields from image analysis
    if (!combined.features?.length && imageData.features?.length) {
      combined.features = imageData.features;
    } else if (imageData.features?.length) {
      combined.features = Array.from(new Set([...(combined.features || []), ...imageData.features]));
    }

    if (!combined.amenities?.length && imageData.amenities?.length) {
      combined.amenities = imageData.amenities;
    } else if (imageData.amenities?.length) {
      combined.amenities = Array.from(new Set([...(combined.amenities || []), ...imageData.amenities]));
    }

    if (!combined.constructionStatus && imageData.constructionStatus) {
      combined.constructionStatus = imageData.constructionStatus;
    }

    if (!combined.bedrooms && imageData.bedrooms) {
      combined.bedrooms = imageData.bedrooms;
    }

    if (!combined.bathrooms && imageData.bathrooms) {
      combined.bathrooms = imageData.bathrooms;
    }

    if (!combined.description && imageData.description) {
      combined.description = imageData.description;
    }
  }

  // Calculate combined confidence
  const docConfidence = documentData?.confidence || 0;
  const imgConfidence = imageData?.confidence || 0;
  combined.confidence = Math.max(docConfidence, imgConfidence);

  return combined;
}
