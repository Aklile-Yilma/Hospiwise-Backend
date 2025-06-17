import { Request, Response } from 'express';
import FailureReport from '../models/FailureReport';
import Equipment from '../models/Equipment';
import MaintenanceHistory from '../models/MaintainanceHistory';
import { issueEnums } from '../models/MaintainanceHistory';
import { v4 as uuidv4 } from 'uuid';

// GET all failure reports
const getAllFailureReports = async (req: Request, res: Response) => {
  try {
    const { status, severity, equipmentType, assignedTechnician, startDate, endDate } = req.query;
    
    // Build filter
    const filter: any = {};
    
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (assignedTechnician) filter.assignedTechnician = assignedTechnician;
    
    if (startDate && endDate) {
      filter.reportedDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    let query = FailureReport.find(filter)
      .populate('equipment', 'name location type serialNo id')
      .sort({ reportedDate: -1 });

    const reports = await query;

    // Filter by equipment type if specified (after population)
    let filteredReports = reports;
    if (equipmentType) {
      filteredReports = reports.filter(report => 
        (report.equipment as any)?.type === equipmentType
      );
    }

    res.json({
      success: true,
      data: filteredReports,
      count: filteredReports.length
    });
  } catch (err: any) {
    console.error('Error fetching failure reports:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET failure report by ID
const getFailureReportById = async (req: Request, res: Response): Promise<any> => {
  try {
    const report = await FailureReport.findById(req.params.id)
      .populate('equipment', 'name location type serialNo id manufacturer modelType');
    
    if (!report) {
      return res.status(404).json({ error: 'Failure report not found' });
    }
    
    res.json({
      success: true,
      data: report
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST create new failure report
const createFailureReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      equipment: equipmentId,
      issue,
      description,
      reportedBy,
      severity,
      assignedTechnician,
      estimatedRepairTime,
      priority,
      notes
    } = req.body;

    // Validate required fields
    if (!equipmentId || !issue || !description || !reportedBy) {
      return res.status(400).json({
        error: 'Missing required fields: equipment, issue, description, reportedBy'
      });
    }

    // Verify equipment exists
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Validate issue type against equipment type
    const validIssues = issueEnums[equipment.type as keyof typeof issueEnums];
    if (validIssues && !validIssues.includes(issue)) {
      return res.status(400).json({
        error: `Invalid issue type for ${equipment.type}. Valid issues: ${validIssues.join(', ')}`
      });
    }

    const failureId = uuidv4();
    // Create failure report
    const failureReport = new FailureReport({
      failureId: failureId,
      equipment: equipmentId,
      issue,
      description,
      reportedBy,
      severity: severity || 'Medium',
      assignedTechnician,
      estimatedRepairTime: estimatedRepairTime ? new Date(estimatedRepairTime) : undefined,
      priority: priority || 3,
      notes: notes ? [{ note: notes, addedBy: reportedBy }] : []
    });

    await failureReport.save();

    // Update equipment status to 'Out of order' or 'Under maintenance' based on severity
    const newStatus = severity === 'Critical' ? 'Out of order' : 'Under maintenance';
    await Equipment.findByIdAndUpdate(equipmentId, { status: newStatus });

    // Populate equipment data before sending response
    await failureReport.populate('equipment', 'name location type serialNo id');

    res.status(201).json({
      success: true,
      data: failureReport,
      message: 'Failure report created successfully'
    });
  } catch (err: any) {
    console.error('Error creating failure report:', err);
    res.status(400).json({ error: err.message });
  }
};

// PUT update failure report
const updateFailureReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      status,
      assignedTechnician,
      estimatedRepairTime,
      actualStartTime,
      priority,
      severity,
      notes,
      addNote
    } = req.body;

    const report = await FailureReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Failure report not found' });
    }

    // Update fields if provided
    if (status !== undefined) report.status = status;
    if (assignedTechnician !== undefined) report.assignedTechnician = assignedTechnician;
    if (estimatedRepairTime !== undefined) report.estimatedRepairTime = new Date(estimatedRepairTime);
    if (actualStartTime !== undefined) report.actualStartTime = new Date(actualStartTime);
    if (priority !== undefined) report.priority = priority;
    if (severity !== undefined) report.severity = severity;

    // Add new note if provided
    if (addNote && addNote.note && addNote.addedBy) {
      report.notes.push({
        note: addNote.note,
        addedBy: addNote.addedBy,
        addedAt: new Date()
      });
    }

    // Replace all notes if provided
    if (notes !== undefined) {
      report.notes = notes;
    }

    // Update start time when status changes to 'In Progress'
    if (status === 'In Progress' && !report.actualStartTime) {
      report.actualStartTime = new Date();
    }

    await report.save();
    await report.populate('equipment', 'name location type serialNo id');

    res.json({
      success: true,
      data: report,
      message: 'Failure report updated successfully'
    });
  } catch (err: any) {
    console.error('Error updating failure report:', err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE failure report
const deleteFailureReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const report = await FailureReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Failure report not found' });
    }

    // Only allow deletion if not resolved
    if (report.status === 'Resolved') {
      return res.status(400).json({ 
        error: 'Cannot delete resolved failure reports. They should be converted to maintenance records.' 
      });
    }

    await FailureReport.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Failure report deleted successfully'
    });
  } catch (err: any) {
    console.error('Error deleting failure report:', err);
    res.status(400).json({ error: err.message });
  }
};

// POST resolve failure report (convert to maintenance record)
const resolveFailureReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const { resolution, technician, resolutionDate } = req.body;

    if (!resolution || !technician) {
      return res.status(400).json({
        error: 'Missing required fields: resolution, technician'
      });
    }

    const report = await FailureReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Failure report not found' });
    }

    if (report.status === 'Resolved') {
      return res.status(400).json({ error: 'Failure report already resolved' });
    }

    // Create maintenance history record
    const maintenanceRecord = new MaintenanceHistory({
      equipment: report.equipment,
      issue: report.issue,
      description: report.description,
      resolution,
      technician,
      maintenanceDate: resolutionDate ? new Date(resolutionDate) : new Date()
    });

    await maintenanceRecord.save();

    // Update failure report status
    report.status = 'Resolved';
    await report.save();

    // Update equipment status back to operational
    await Equipment.findByIdAndUpdate(report.equipment, { 
      status: 'Operational',
      lastMaintenanceDate: new Date()
    });

    res.json({
      success: true,
      data: {
        failureReport: report,
        maintenanceRecord
      },
      message: 'Failure report resolved and maintenance record created'
    });
  } catch (err: any) {
    console.error('Error resolving failure report:', err);
    res.status(400).json({ error: err.message });
  }
};

// GET failure report statistics
const getFailureReportStatistics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, equipmentType } = req.query;
    
    // Build match filter
    const matchFilter: any = {};
    
    if (startDate && endDate) {
      matchFilter.reportedDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    let pipeline: any[] = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'equipments',
          localField: 'equipment',
          foreignField: '_id',
          as: 'equipmentDetails'
        }
      },
      { $unwind: '$equipmentDetails' }
    ];

    // Filter by equipment type if specified
    if (equipmentType) {
      pipeline.push({
        $match: { 'equipmentDetails.type': equipmentType }
      });
    }

    // Add aggregation stages
    pipeline.push(
      {
        $group: {
          _id: {
            status: '$status',
            severity: '$severity',
            equipmentType: '$equipmentDetails.type'
          },
          count: { $sum: 1 },
          avgResolutionTime: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'Resolved'] },
                {
                  $divide: [
                    { $subtract: ['$updatedAt', '$reportedDate'] },
                    1000 * 60 * 60 * 24 // Convert to days
                  ]
                },
                null
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id.equipmentType',
          statusBreakdown: {
            $push: {
              status: '$_id.status',
              severity: '$_id.severity',
              count: '$count',
              avgResolutionTime: '$avgResolutionTime'
            }
          },
          totalReports: { $sum: '$count' }
        }
      },
      {
        $sort: { totalReports: -1 }
      }
    );

    const statistics = await FailureReport.aggregate(pipeline);

    res.json({
      success: true,
      data: statistics
    });
  } catch (err: any) {
    console.error('Error fetching failure report statistics:', err);
    res.status(500).json({ error: err.message });
  }
};

export default {
  getAllFailureReports,
  getFailureReportById,
  createFailureReport,
  updateFailureReport,
  deleteFailureReport,
  resolveFailureReport,
  getFailureReportStatistics
};