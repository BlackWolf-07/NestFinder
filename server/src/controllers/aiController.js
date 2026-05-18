const geminiService = require('../services/geminiService');
const Property = require('../models/Property');

exports.recommendProperties = async (req, res) => {
  try {
    const userPreferences = req.body;
    
    // Fetch relevant properties for AI to filter
    const { properties: allProperties } = await Property.getAll({ 
      city: userPreferences.city,
      type: userPreferences.type
    });

    if (allProperties.length === 0) {
      return res.json([]);
    }

    const aiMatches = await geminiService.getRecommendations(userPreferences, allProperties);

    // Combine AI reasons with property data
    const recommendations = aiMatches.map(match => {
      const prop = allProperties.find(p => p.id === match.id);
      if (!prop) return null;
      return { ...prop, aiReason: match.reason };
    }).filter(p => p !== null);

    res.json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI Recommendation failed' });
  }
};

exports.propertyChat = async (req, res) => {
  try {
    const { message, history } = req.body;
    const property = await Property.getById(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const aiResponse = await geminiService.getPropertyChatResponse(property, message, history);
    res.json({ reply: aiResponse });
  } catch (error) {
    res.status(500).json({ error: 'Chat failed' });
  }
};

exports.generalAssistant = async (req, res) => {
  try {
    const { message } = req.body;
    const response = await geminiService.getGeneralAssistantResponse(message);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Assistant failed' });
  }
};
