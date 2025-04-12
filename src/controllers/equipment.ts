import { Request, Response } from 'express';
import Equipment from '../models/Equipment';
import MaintenanceHistory from '../models/MaintainanceHistory';

// GET all equipment
const getAllEquipment = async (req: Request, res: Response) => {
  try {
    const equipments = await Equipment.find();
    res.json({equipments});
  } catch (err: any) {
    console.log("Error fetching equipment:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST a new piece of equipment
const createEquipment = async (req: Request, res: Response) => {
  try {
    const { name, location, status, lastMaintenanceDate } = req.body;
    const newEquipment = new Equipment({ name, location, status, lastMaintenanceDate });
    await newEquipment.save();
    res.status(201).json(newEquipment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// PUT (update) an equipment by ID
const updateEquipment = async (req: Request, res: Response): Promise<any> => {
  try {
    const updatedEquipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(updatedEquipment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE an equipment by ID
const deleteEquipment = async (req: Request, res: Response): Promise<any> => {
  try {
    const deletedEquipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!deletedEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json({ message: 'Equipment deleted' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// POST maintenance report for equipment
const reportIssue = async (req: Request, res: Response) => {
  try {
    const { issue, technician, description } = req.body;
    const maintenanceHistory = new MaintenanceHistory({
      equipment: req.params.id,
      maintenanceDate: new Date(),
      issue,
      resolution: "Unknown",
      technician,
      description
    });

    // Update the equipment's status and last maintenance date
    await Equipment.findByIdAndUpdate(req.params.id, {
      status: 'under maintenance',
      lastMaintenanceDate: new Date(),
    });

    await maintenanceHistory.save();
    res.status(201).json(maintenanceHistory);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export {
  getAllEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  reportIssue,
};
