// Instead of:
import * as equipmentController from '../controllers/equipment';

// Use:
import { 
  getAllEquipment,
  createEquipment, 
  updateEquipment,
  deleteEquipment,
  reportIssue,
  getEquipmentById
} from '../controllers/equipment';
import express from 'express';

const equipmentRouter = express.Router();

// GET all equipment
equipmentRouter.get('/', getAllEquipment);

// Get one equipment
equipmentRouter.get('/:id', getEquipmentById);

// POST a new piece of equipment
equipmentRouter.post('/', createEquipment);

// PUT (update) an equipment by ID
equipmentRouter.put('/:id', updateEquipment);

// DELETE an equipment by ID
equipmentRouter.delete('/:id', deleteEquipment);

// POST maintenance report for equipment
equipmentRouter.post('/:id/report-issue', reportIssue);

export default equipmentRouter;