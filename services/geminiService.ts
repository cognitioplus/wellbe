import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysis, Measurement, TrendAnalysis } from '../types';

const MODEL_NAME = "gemini-2.5-flash";

export async function analyzeHrv(hrv: number): Promise<GeminiAnalysis> {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        // Return mock data if API key is not available
        return {
            stressLevel: 'Analysis Unavailable',
            analysis: 'API key not configured. This is mock data. Please configure your Gemini API key to get a real analysis.',
            tips: ['Check your API key configuration.', 'Breathe deeply for one minute.', 'Stay hydrated.']
        };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are a wellness coach explaining Heart Rate Variability (HRV) to a user.
    The user's HRV score, measured as RMSSD (Root Mean Square of Successive Differences), is ${hrv.toFixed(2)} ms. RMSSD is a reliable indicator of the parasympathetic nervous system's activity, which is associated with 'rest-and-digest' functions.

    Based on this score, your task is to:
    1.  Categorize the physiological stress level into one of: 'Low', 'Balanced', 'High', or 'Very High'. Use these general guidelines:
        - Low: RMSSD > 60ms (Indicates good recovery)
        - Balanced: RMSSD 40-60ms (Indicates a normal state)
        - High: RMSSD 20-40ms (Indicates significant stress or fatigue)
        - Very High: RMSSD < 20ms (Indicates extreme stress or poor recovery)

    2.  Provide a brief, encouraging, and easy-to-understand analysis (2-3 sentences). Explain what this score means for their autonomic nervous system (ANS). Touch upon the balance between the 'fight-or-flight' (sympathetic) and 'rest-and-digest' (parasympathetic) systems. A higher HRV generally suggests a flexible and resilient state ('rest-and-digest' dominance), while a lower HRV suggests the body is in a stress-dominant state ('fight-or-flight').

    3.  Suggest 3 simple, actionable well-being tips tailored to this specific stress level and HRV score.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        stressLevel: {
                            type: Type.STRING,
                            description: "The categorized stress level ('Low', 'Balanced', 'High', 'Very High')."
                        },
                        analysis: {
                            type: Type.STRING,
                            description: "A brief, encouraging analysis of the HRV score and stress level."
                        },
                        tips: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            },
                            description: "An array of 3 actionable well-being tips."
                        }
                    },
                    required: ["stressLevel", "analysis", "tips"]
                },
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText) as GeminiAnalysis;

        // Basic validation
        if (parsedResponse.stressLevel && parsedResponse.analysis && Array.isArray(parsedResponse.tips)) {
             return parsedResponse;
        } else {
            throw new Error("Invalid JSON structure from Gemini API");
        }
    } catch (error) {
        console.error("Error analyzing HRV with Gemini:", error);
        throw new Error("Failed to get analysis from AI. Please try again.");
    }
}


export async function analyzeHrvTrend(history: Measurement[]): Promise<TrendAnalysis> {
    if (!process.env.API_KEY) {
        return {
            trendAnalysis: 'API key not configured. Trend analysis is unavailable.',
            keyTakeaway: 'Please configure your Gemini API key to get personalized insights.'
        };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Ensure chronological order (oldest to newest) for the prompt
    const reversedHistory = [...history].reverse(); 
    const promptData = reversedHistory.map(m => ({ date: m.date, hrv: parseFloat(m.hrv.toFixed(1)) }));

    const prompt = `You are a wellness coach analyzing a user's Heart Rate Variability (HRV) trend.
    The user's HRV scores (RMSSD in ms) are provided below, from oldest to newest.
    A higher HRV is generally better, indicating good recovery and lower stress. A lower HRV suggests higher stress or fatigue.

    Data: ${JSON.stringify(promptData)}

    Based on this data, your task is to provide a brief, encouraging, and easy-to-understand analysis in JSON format.
    1.  **trendAnalysis**: A 2-3 sentence summary of the trend. Is it generally increasing, decreasing, or staying stable? What might this indicate about their recent stress and recovery patterns?
    2.  **keyTakeaway**: One single, actionable tip or key takeaway based on their trend. For example, if their HRV is consistently low, suggest prioritizing sleep. If it's improving, encourage them to continue their current habits.`;

    try {
         const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        trendAnalysis: {
                            type: Type.STRING,
                            description: "A 2-3 sentence summary of the HRV trend."
                        },
                        keyTakeaway: {
                            type: Type.STRING,
                            description: "One single, actionable tip or key takeaway based on the trend."
                        }
                    },
                    required: ["trendAnalysis", "keyTakeaway"]
                },
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText) as TrendAnalysis;

        if (parsedResponse.trendAnalysis && parsedResponse.keyTakeaway) {
             return parsedResponse;
        } else {
            throw new Error("Invalid JSON structure from Gemini API for trend analysis");
        }

    } catch(error) {
        console.error("Error analyzing HRV trend with Gemini:", error);
        throw new Error("Failed to get trend analysis from AI.");
    }

}
