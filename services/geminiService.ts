
import { GoogleGenAI } from "@google/genai";
import { TripDetails, ItineraryResponse, TripPlan } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateItinerary = async (details: TripDetails): Promise<ItineraryResponse> => {
  try {
    const prompt = `
    Role: You are 'JourneyX Pro', an expert local travel planner.
    Language: **MUST BE Traditional Chinese (繁體中文 - Taiwan usage)**.
    
    Task: Plan a trip to ${details.destination} for ${details.startDate} to ${details.endDate}.
    Members: ${details.members}.
    Must Visit: ${details.mustVisit}.
    Accommodation: ${details.accommodation}.
    Preferences: ${details.preferences}.

    Requirements:
    1. **Hyper-Localization**: Recommend local gems, verify restaurants.
    2. **Logistics**: Calculate best transport. Mention specific subway exits.
    3. **Pacing**: Include rest breaks.
    4. **Coordinates**: MUST provide accurate Lat/Lng for every location.
    5. **Rain Plan**: Provide indoor alternatives.
    6. **Budget**: Estimate costs in local currency or TWD.
    7. **Visual Vibe**: Analyze the destination and choose one style: 'modern' (City/Tech), 'historical' (Culture/Old), 'nature' (Mountains/Forest), or 'tropical' (Beach/Island).
    
    Output Format:
    You MUST return a strictly valid JSON object. 
    Do not wrap it in markdown code blocks. 
    Just return the raw JSON string.
    
    The JSON must match this structure exactly:
    {
      "tripTitle": "Creative Trip Title in Traditional Chinese",
      "destination": "Destination Name",
      "duration": "e.g., 5天4夜",
      "totalBudgetEstimate": "Total Budget Estimate",
      "visualVibe": "modern" | "historical" | "nature" | "tropical",
      "generalTips": ["Tip 1", "Tip 2", "Tip 3"],
      "days": [
        {
          "day": 1,
          "date": "YYYY-MM-DD",
          "theme": "Day Theme",
          "summary": "Day Summary",
          "activities": [
            {
              "time": "HH:MM",
              "title": "Activity Name",
              "description": "Details",
              "type": "sightseeing" | "food" | "transport" | "shopping" | "rest" | "other",
              "transportDetail": "Transport info",
              "cost": "Cost estimate",
              "localTip": "Expert tip",
              "duration": "Duration",
              "bookingRequired": boolean,
              "rainPlan": "Rain backup",
              "location": {
                "lat": number,
                "lng": number,
                "name": "Location Name",
                "address": "Address"
              }
            }
          ]
        }
      ]
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    let jsonText = response.text || "{}";
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

    // Basic cleanup for common JSON errors if any
    if (jsonText.startsWith('`')) jsonText = jsonText.slice(1);
    if (jsonText.endsWith('`')) jsonText = jsonText.slice(0, -1);

    const plan = JSON.parse(jsonText) as TripPlan;
    
    return {
      plan: plan,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
