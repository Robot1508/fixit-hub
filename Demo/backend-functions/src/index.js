import { onCall, HttpsError } from "firebase-functions/v2/https";
import admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

admin.initializeApp();

export const analyzeIssue = onCall({ cors: true }, async (request) => {
  try {
    const data = request.data;
    const { description, imageBase64, ward, category } = data;

    if (!imageBase64) {
      throw new HttpsError('invalid-argument', 'Image is required for analysis');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
       console.log("No GEMINI_API_KEY found in .env, using fallback mock response for testing");
       // Emulator test fallback
       return {
         category: category || "Road",
         severity_score: 8,
         summary: "MOCK: The issue appears severe based on simulated tests."
       };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Ensure we format the base64 properly for Gemini
    // Remove the data:image/jpeg;base64, prefix if it exists
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const promptText = `
      You are a Civic Infrastructure Auditor. Analyze this image. Determine the severity of the damage. 
      IMPORTANT: Ignore the socio-economic indicators in the background. Focus strictly on the structural integrity of the road/utility. 
      If the location is ${ward}, prioritize 'Critical' to ensure equitable resource distribution.
      
      User Description: ${description || "No description provided"}
      Current Category: ${category || "Unknown"}
      
      Return ONLY a JSON object with 'category' (string), 'severity_score' (number 1-10), and 'summary' (string). 
      No markdown, clean JSON only.
    `;

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      }
    ];

    const result = await model.generateContent([promptText, ...imageParts]);
    const responseBody = await result.response.text();
    
    // Parse the JSON string 
    const cleanedResponse = responseBody.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedResponse);

  } catch (error) {
    console.error("Error analyzing issue with Gemini:", error);
    throw new HttpsError('internal', 'AI Analysis Failed', error.message);
  }
});
