import express from 'express';
import failureReportController from '../controllers/failureReportController';

const router = express.Router();

// GET all failure reports with optional filtering
router.get('/', failureReportController.getAllFailureReports);

// GET failure report statistics
router.get('/statistics', failureReportController.getFailureReportStatistics);

// GET specific failure report by ID
router.get('/:id', failureReportController.getFailureReportById);

// POST create new failure report
router.post('/', failureReportController.createFailureReport);

// PUT update failure report
router.put('/:id', failureReportController.updateFailureReport);

// POST resolve failure report (convert to maintenance record)
router.post('/:id/resolve', failureReportController.resolveFailureReport);

// DELETE failure report
router.delete('/:id', failureReportController.deleteFailureReport);

export default router;