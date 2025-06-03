import { Request, Response, NextFunction } from 'express';
import { askGPT } from '../services/gptService';
import { ChatSession } from '../models/ChatSession'; // NEW import

export const queryAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt, sessionId, equipmentData } = req.body;

    if (!prompt && !equipmentData) {
      return res.status(400).json({ error: 'Prompt or equipment data required' });
    }

    let currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get or create session from MongoDB
    let session = await ChatSession.findOne({ sessionId: currentSessionId });
    if (!session) {
      session = new ChatSession({
        sessionId: currentSessionId,
        messages: [],
        equipment: null
      });
    }

    // Handle initial equipment data
    if (equipmentData) {
      session.equipment = equipmentData;
      session.equipmentId = equipmentData._id;
      
      const equipmentContext = `
EQUIPMENT INFO:
- Name: ${equipmentData.name}
- Type: ${equipmentData.type}
- Model: ${equipmentData.modelType} by ${equipmentData.manufacturer}
- Status: ${equipmentData.status}
- Operating Hours: ${equipmentData.operatingHours}
- Last Maintenance: ${equipmentData.lastMaintenanceDate || 'None'}
- Maintenance History: ${equipmentData.maintenanceHistory?.length || 0} records

You are an expert equipment maintenance assistant. Provide helpful troubleshooting and maintenance advice for this equipment.`;

      session.messages.push({ role: 'system', content: equipmentContext });
      
      const initialPrompt = "Please analyze this equipment and provide an overview of its current status, any concerns, and general maintenance recommendations.";
      session.messages.push({ role: 'user', content: initialPrompt });
      
      const response = await askGPT(session.messages.map(m => `${m?.role?.toUpperCase()}: ${m.content}`).join('\n\n'));
      
      session.messages.push({ role: 'assistant', content: response });
      session.lastActivity = new Date();
      await session.save(); // SAVE to MongoDB
      
      return res.json({ response, sessionId: currentSessionId });
    }

    // Handle follow-up messages
    if (prompt) {
      session.messages.push({ role: 'user', content: prompt });
      
      // Keep last 10 messages for context
      const recentMessages = session.messages.slice(-10);
      const conversationText = recentMessages.map(m => `${m?.role?.toUpperCase()}: ${m.content}`).join('\n\n');
      
      const response = await askGPT(conversationText);
      
      session.messages.push({ role: 'assistant', content: response });
      session.lastActivity = new Date();
      await session.save(); // SAVE to MongoDB
      
      return res.json({ response, sessionId: currentSessionId });
    }

  } catch (err) {
    console.error('AI Query Error:', err);
    next(err);
  }
};