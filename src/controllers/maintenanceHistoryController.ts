import { Request, Response } from 'express';
import MaintenanceHistory, { issueEnums } from '../models/MaintainanceHistory';
import Equipment from '../models/Equipment';

// GET all maintenance history
const getAllMaintenanceHistory = async (req: Request, res: Response) => {
  try {
    const history = await MaintenanceHistory.find()
      .populate('equipment', 'name location type')
      .sort({ maintenanceDate: -1 });
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET maintenance history by equipment ID
const getMaintenanceHistoryByEquipment = async (req: Request, res: Response) => {
  try {
    const history = await MaintenanceHistory.find({ equipment: req.params.equipmentId })
      .populate('equipment', 'name location type')
      .sort({ maintenanceDate: -1 });
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET maintenance history by ID
const getMaintenanceHistoryById = async (req: Request, res: Response): Promise<any> => {
  try {
    const history = await MaintenanceHistory.findById(req.params.id)
      .populate('equipment', 'name location type');
    
    if (!history) {
      return res.status(404).json({ error: 'Maintenance history not found' });
    }
    
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST a new maintenance history record
const createMaintenanceHistory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { issue, description, resolution, technician, maintenanceDate } = req.body;
    const equipmentId = req.params.equipmentId || req.body.equipment;

    // Fetch the equipment from the DB
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Create new maintenance history record
    const maintenanceHistory = new MaintenanceHistory({
      equipment: equipment._id,
      issue,
      description,
      resolution,
      technician,
      maintenanceDate: maintenanceDate || new Date()
    });

    // Save maintenance record
    const savedHistory = await maintenanceHistory.save();

    // Update equipment status and last maintenance date
    equipment.status = 'Under maintenance';
    equipment.lastMaintenanceDate = new Date();
    await equipment.save();

    // Populate equipment details before sending response
    await savedHistory.populate('equipment', 'name location type');

    res.status(201).json(savedHistory);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// PUT (update) maintenance history by ID
const updateMaintenanceHistory = async (req: Request, res: Response): Promise<any> => {
  try {
    const updatedHistory = await MaintenanceHistory.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('equipment', 'name location type');
    
    if (!updatedHistory) {
      return res.status(404).json({ message: 'Maintenance history not found' });
    }
    
    res.json(updatedHistory);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE a maintenance history record by ID
const deleteMaintenanceHistory = async (req: Request, res: Response): Promise<any> => {
  try {
    const deletedHistory = await MaintenanceHistory.findByIdAndDelete(req.params.id);
    if (!deletedHistory) {
      return res.status(404).json({ message: 'Maintenance history not found' });
    }
    res.json({ message: 'Maintenance history deleted' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// GET valid issues for specific equipment type
const getValidIssuesForEquipmentType = async (req: Request, res: Response): Promise<any> => {
  try {
    const { equipmentType } = req.params;
    
    const validIssues = issueEnums[equipmentType as keyof typeof issueEnums];
    
    if (!validIssues) {
      return res.status(404).json({ error: 'Invalid equipment type' });
    }

    res.json({
      equipmentType,
      validIssues
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET valid issues for equipment by ID
const getValidIssuesForEquipment = async (req: Request, res: Response): Promise<any> => {
  try {
    const equipment = await Equipment.findById(req.params.equipmentId);
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const validIssues = issueEnums[equipment.type as keyof typeof issueEnums];
    
    if (!validIssues) {
      return res.status(404).json({ error: 'Invalid equipment type' });
    }

    res.json({
      equipmentId: equipment._id,
      equipmentType: equipment.type,
      validIssues
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET all issue enums
const getAllIssueEnums = async (req: Request, res: Response) => {
  try {
    res.json(issueEnums);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET maintenance statistics
const getMaintenanceStatistics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, equipmentType } = req.query;
    
    // Build filter
    const filter: any = {};
    if (startDate && endDate) {
      filter.maintenanceDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    let pipeline: any[] = [
      { $match: filter },
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
            equipmentType: '$equipmentDetails.type',
            issue: '$issue'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.equipmentType',
          totalIssues: { $sum: '$count' },
          issueBreakdown: {
            $push: {
              issue: '$_id.issue',
              count: '$count'
            }
          }
        }
      },
      {
        $sort: { totalIssues: -1 }
      }
    );

    const statistics = await MaintenanceHistory.aggregate(pipeline);

    res.json(statistics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  getAllMaintenanceHistory,
  getMaintenanceHistoryByEquipment,
  getMaintenanceHistoryById,
  createMaintenanceHistory,
  updateMaintenanceHistory,
  deleteMaintenanceHistory,
  getValidIssuesForEquipmentType,
  getValidIssuesForEquipment,
  getAllIssueEnums,
  getMaintenanceStatistics,
};