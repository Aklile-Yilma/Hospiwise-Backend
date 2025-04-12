import { Request, Response, NextFunction } from 'express';
import { askGPT } from '../services/gptService';

export const queryAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt } = req.body;

    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
  
    const response = await askGPT(prompt);
    return res.json({ response });
  } catch (err) {
    next(err);
  }
};
