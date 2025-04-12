import express from 'express';
import * as equipmentController from '../controllers/equipment';


const equipmentRouter = express.Router();

// GET all equipment
equipmentRouter.get('/', equipmentController.getAllEquipment);

// POST a new piece of equipment
equipmentRouter.post('/', equipmentController.createEquipment);

// PUT (update) an equipment by ID
equipmentRouter.put('/:id', equipmentController.updateEquipment);

// DELETE an equipment by ID
equipmentRouter.delete('/:id', equipmentController.deleteEquipment);

// POST maintenance report for equipment
equipmentRouter.post('/:id/report-issue', equipmentController.reportIssue);

export default equipmentRouter;
