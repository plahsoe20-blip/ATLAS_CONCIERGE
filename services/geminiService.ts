import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// ---------------------------
// CHAT & GROUNDING
// ---------------------------

export const sendMessageToAssistant = async (
  message: string,
  history: any[]
) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview', // Smartest model for reasoning
    config: {
      systemInstruction: "You are ATLAS, a premium concierge AI assistant. You help users find destinations, plan routes, and get premium lifestyle advice. Be concise, elegant, and professional. Always use ground search for specific location queries.",
      tools: [{ googleSearch: {} }, { googleMaps: {} }],
    },
    history: history
  });

  const response = await chat.sendMessage({ message });
  return response;
};

// ---------------------------
// IMAGE GENERATION (Aspect Ratios)
// ---------------------------

export const generateConciergeImage = async (prompt: string, aspectRatio: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', // High quality generation
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any, 
          imageSize: "1K"
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image gen error", e);
    throw e;
  }
};

// ---------------------------
// IMAGE EDITING (Nano Banana)
// ---------------------------

export const editConciergeImage = async (base64Image: string, prompt: string) => {
  const ai = getAI();
  try {
    // Clean base64 header if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // "Nano Banana" equivalent for editing
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image edit error", e);
    throw e;
  }
};

// ---------------------------
// FAST QUOTE (Lite Model)
// ---------------------------

export const getFastQuoteEstimate = async (details: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Basic Text Tasks
    contents: `Analyze this trip request and estimate a distance in KM and duration in hours. Return JSON only: {"km": number, "hours": number}. Request: ${details}`,
    config: {
        responseMimeType: "application/json"
    }
  });
  
  return response.text;
};