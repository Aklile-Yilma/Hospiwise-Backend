import express from 'express';
import maintenanceController from '../controllers/maintenanceHistoryController';

const router = express.Router();

// GET routes
router.get('/', maintenanceController.getAllMaintenanceHistory);
router.get('/statistics', maintenanceController.getMaintenanceStatistics);
router.get('/issues/all', maintenanceController.getAllIssueEnums);
router.get('/issues/type/:equipmentType', maintenanceController.getValidIssuesForEquipmentType);
router.get('/issues/equipment/:equipmentId', maintenanceController.getValidIssuesForEquipment);
router.get('/equipment/:equipmentId', maintenanceController.getMaintenanceHistoryByEquipment);
router.get('/:id', maintenanceController.getMaintenanceHistoryById);

// POST routes
router.post('/', maintenanceController.createMaintenanceHistory);
router.post('/equipment/:equipmentId', maintenanceController.createMaintenanceHistory);

// PUT routes
router.put('/:id', maintenanceController.updateMaintenanceHistory);

// DELETE routes
router.delete('/:id', maintenanceController.deleteMaintenanceHistory);

export default router;