import { Request, Response } from 'express'
import MaintenanceHistory from '../models/MaintainanceHistory'
import Equipment from '../models/Equipment';

// GET all maintenance history
const getAllMaintenanceHistory = async (req: Request, res: Response) => {
  try {
    const history = await MaintenanceHistory.find().populate('equipment', 'name location');
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET maintenance history by equipment ID
const getMaintenanceHistoryByEquipment = async (req: Request, res: Response) => {
  try {
    const history = await MaintenanceHistory.find({ equipment: req.params.equipmentId }, {}, { sort: { maintenanceDate: -1 } })
      .populate('equipment', 'name location');
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST a new maintenance history record
const createMaintenanceHistory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { issue, description, resolution, technician } = req.body;
    const equipmentId = req.params.equipmentId;

    // Fetch the equipment from the DB
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Create new maintenance history record
    const maintenanceHistory = new MaintenanceHistory({
      equipment: equipment._id,
      maintenanceDate: new Date(),
      issue,
      description,
      resolution,
      technician,
    });

    // Save maintenance record
    await maintenanceHistory.save();

    // Update equipment status and last maintenance date
    equipment.status = 'Under maintenance';
    equipment.lastMaintenanceDate = new Date();
    await equipment.save();

    res.status(201).json(maintenanceHistory);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// PUT (update) maintenance history by ID
const updateMaintenanceHistory = async (req: Request, res: Response): Promise<any> => {
  try {
    const updatedHistory = await MaintenanceHistory.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

export default {
  getAllMaintenanceHistory,
  getMaintenanceHistoryByEquipment,
  createMaintenanceHistory,
  updateMaintenanceHistory,
  deleteMaintenanceHistory,
};
