const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getRecommendations = async (userPreferences, properties) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an expert real estate consultant for "NestFinder".
      
      User Preferences:
      - Budget: ${userPreferences.budget}
      - Location: ${userPreferences.city}, ${userPreferences.locality || 'Any'}
      - Type: ${userPreferences.type} (rent/buy)
      - Category: ${userPreferences.category || 'Any'}
      - BHK: ${userPreferences.bhk || 'Any'}
      - Lifestyle: ${userPreferences.lifestyle} (e.g. pet-friendly, family, bachelor)
      - Amenities: ${userPreferences.amenities?.join(', ') || 'Any'}

      Available Properties (JSON):
      ${JSON.stringify(properties.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        location: p.location,
        bhk: p.bhk,
        amenities: p.amenities,
        description: p.description
      })))}

      Task:
      1. Select the top 5 properties that best match the user's preferences.
      2. For each, provide a brief "AI Insight" explaining exactly why it fits their lifestyle and budget.
      3. Return the result in a valid JSON array format like this:
      [{"id": 1, "reason": "..."}, {"id": 2, "reason": "..."}]
      
      Only return the JSON. No conversational text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON from potential markdown blocks
    const cleanJson = text.replace(/```json|```/gi, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    // Fallback simple matching if AI fails
    return properties.slice(0, 5).map(p => ({ id: p.id, reason: "Highly rated property in your area." }));
  }
};

exports.getPropertyChatResponse = async (property, message, history = []) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      })),
    });

    const context = `
      You are an AI assistant for a specific property listing on NestFinder.
      Property Details:
      Title: ${property.title}
      Price: ${property.price}
      Location: ${property.location}, ${property.locality}, ${property.city}
      Type: ${property.type}
      Category: ${property.category}
      BHK: ${property.bhk}
      Furnishing: ${property.furnishing}
      Amenities: ${JSON.parse(property.amenities).join(', ')}
      Description: ${property.description}

      Answer the user's question accurately based ONLY on the details provided above. 
      If information is not available, say "I don't have that specific information, but you can contact the owner for more details."
      Be helpful, concise, and professional.
    `;

    const result = await chat.sendMessage(`${context}\n\nUser Question: ${message}`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Property Chat Error:", error);
    return "I'm having trouble connecting to my brain right now. Please try again later!";
  }
};

exports.getGeneralAssistantResponse = async (message) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are the NestFinder General Assistant. Your goal is to help users find properties using natural language.
      
      User Message: "${message}"

      Task:
      1. Analyze the message for property search criteria (city, type, budget, bhk, category).
      2. If you find filters, return them in a JSON object.
      3. Provide a friendly conversational response.

      Return format:
      {
        "filters": { "city": "...", "maxPrice": ..., "bhk": ..., "type": "..." },
        "reply": "..."
      }

      Example:
      User: "Show me 2BHK under $1500 in Lucknow"
      Response: { "filters": { "city": "Lucknow", "maxPrice": 1500, "bhk": 2 }, "reply": "Sure! I've found some 2BHK options in Lucknow under $1500 for you." }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json|```/gi, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    return { filters: {}, reply: "I'm here to help you find your dream home. What are you looking for?" };
  }
};
