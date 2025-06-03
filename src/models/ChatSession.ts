// models/ChatSession.js (NEW FILE)
import mongoose from 'mongoose';

const ChatSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  equipmentId: { type: String },
  equipment: { type: Object }, // Store equipment data
  messages: [{
    role: { type: String, enum: ['system', 'user', 'assistant'] },
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

// Auto-delete sessions after 24 hours of inactivity
ChatSessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 });

export const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);