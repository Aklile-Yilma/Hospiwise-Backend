import { Router } from 'express';
import { queryAI } from '../controllers/aiController';

const aiRouter = Router();

aiRouter.post('/query', queryAI as any);

export default aiRouter;