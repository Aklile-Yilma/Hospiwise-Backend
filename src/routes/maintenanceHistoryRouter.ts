import express from 'express';
import maintenanceHistoryController from '../controllers/maintenanceHistoryController';

const MaintenanceHistoryRouter = express.Router();

// GET all maintenance history
MaintenanceHistoryRouter.get('/', maintenanceHistoryController.getAllMaintenanceHistory);

// GET maintenance history by equipment ID
MaintenanceHistoryRouter.get('/:equipmentId', maintenanceHistoryController.getMaintenanceHistoryByEquipment);

// POST a new maintenance history record
MaintenanceHistoryRouter.post('/:equipmentId', maintenanceHistoryController.createMaintenanceHistory);

// PUT (update) a maintenance history record by ID
MaintenanceHistoryRouter.put('/:id', maintenanceHistoryController.updateMaintenanceHistory);

// DELETE a maintenance history record by ID
MaintenanceHistoryRouter.delete('/:id', maintenanceHistoryController.deleteMaintenanceHistory);

export default MaintenanceHistoryRouter;
