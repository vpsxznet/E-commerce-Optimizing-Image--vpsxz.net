import { GoogleGenAI } from "@google/genai";
import { SceneOption } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash-image';

export const generateOptimizedImage = async (
  base64Image: string,
  mimeType: string,
  scene: SceneOption,
  productDescription?: string
): Promise<string> => {
  try {
    const systemPrompt = `
Role: You are an expert e-commerce image editor for TikTok Shop Malaysia.

Context:
${productDescription ? `The user has identified this product as: "${productDescription}". Use this to guide your scene generation and marketing copy.` : ''}

Task:
1. Analyze the uploaded product image. ${productDescription ? `(Focus on identifying the "${productDescription}")` : ''}
2. Scene Detection/Generation: ${scene.id === 'auto' ? 'Deduce the best realistic context based on the product type to maximize appeal for Malaysian buyers.' : `Place the product strictly in the following setting: ${scene.prompt}`}
3. Visual Enhancement: Ensure the output is photo-realistic. Lighting and color balance must look professional yet authentic (not fake/AI-generated look).
4. Text Overlay: Add a SHORT, high-impact English marketing tagline (e.g., "Best Seller!", "Flash Sale", "Premium Quality", "Malaysia's No.1").
   - Font should be modern, bold, and readable.
   - Place text in non-obtrusive areas (negative space).
   - STRICTLY ENGLISH ONLY. No Chinese text.

Constraints:
- OUTPUT MUST BE AN IMAGE.
- Do not alter the physical structure or logo of the product itself.
- High-resolution, realistic aesthetic.
- The output image should be 1:1 aspect ratio if possible, or maintain original aspect ratio.
    `.trim();

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            text: systemPrompt,
          },
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
        ],
      },
    });

    // Check for inlineData (Base64 image) in the response
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
        const parts = candidates[0].content.parts;
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                 return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            }
        }
    }
    
    throw new Error('No image data found in response');

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
