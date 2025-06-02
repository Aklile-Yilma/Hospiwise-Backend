import { Request, Response } from 'express';
import Equipment from '../models/Equipment';
import MaintenanceHistory from '../models/MaintainanceHistory';

// GET all equipment
const getAllEquipment = async (req: Request, res: Response) => {
  try {
    const equipments = await Equipment.find();
    res.json({ equipments });
  } catch (err: any) {
    console.log("Error fetching equipment:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET equipment by type
const getEquipmentByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const validTypes = ['Defibrillator', 'Infusion pump', 'Patient monitor', 'Suction machine'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid equipment type' });
    }
    
    const equipments = await Equipment.find({ type });
    res.json({ equipments });
  } catch (err: any) {
    console.log("Error fetching equipment by type:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET equipment by ID
const getEquipmentById = async (req: Request, res: Response) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      res.status(404).json({ message: 'Equipment not found' });
      return
    }
    res.json(equipment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST a new piece of equipment
const createEquipment = async (req: Request, res: Response) => {
  try {
    const { 
      type,
      serialNo,
      location,
      status,
      manualLink,
      imageLink,
      installationDate,
      manufacturer,
      modelType,
      operatingHours,
      lastMaintenanceDate 
    } = req.body;

    // Validate required fields
    if (!type || !serialNo || !location || !status || !installationDate || !manufacturer || !modelType) {
      res.status(400).json({ 
        error: 'Missing required fields: type, serialNo, location, status, installationDate, manufacturer, modelType' 
      });
      return;
    }

    // Check if serialNo already exists
    const existingEquipment = await Equipment.findOne({ serialNo });
    if (existingEquipment) {
       res.status(400).json({ error: 'Equipment with this serial number already exists' });
       return;
    }

    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    
    // Create type prefix (first 3 letters of type)
    let typePrefix = '';
    switch(type) {
      case 'Defibrillator':
        typePrefix = 'DEF';
        break;
      case 'Infusion pump':
        typePrefix = 'INF';
        break;
      case 'Patient monitor':
        typePrefix = 'PAT';
        break;
      case 'Suction machine':
        typePrefix = 'SUC';
        break;
      default:
        typePrefix = 'EQP';
    }
    
    const id = `${typePrefix}_${randomDigits}`;
    const name = id; // Set name exactly same as id

    const newEquipment = new Equipment({ 
      id,
      name,
      type,
      serialNo,
      location,
      status,
      manualLink,
      imageLink,
      installationDate: new Date(installationDate),
      manufacturer,
      modelType,
      operatingHours: operatingHours || 0,
      lastMaintenanceDate: lastMaintenanceDate ? new Date(lastMaintenanceDate) : undefined
    });

    await newEquipment.save();
    res.status(201).json(newEquipment);
  } catch (err: any) {
    console.log("Error creating equipment:", err);
    res.status(400).json({ error: err.message });
  }
};

// PUT (update) an equipment by ID
const updateEquipment = async (req: Request, res: Response) => {
  try {
    const { 
      type,
      serialNo,
      location,
      status,
      manualLink,
      imageLink,
      installationDate,
      manufacturer,
      modelType,
      operatingHours,
      lastMaintenanceDate 
    } = req.body;

    // Check if serialNo is being updated and if it already exists
    if (serialNo) {
      const existingEquipment = await Equipment.findOne({ 
        serialNo, 
        _id: { $ne: req.params.id } 
      });
      if (existingEquipment) {
         res.status(400).json({ error: 'Equipment with this serial number already exists' });
         return
      }
    }

    const updateData: any = {};
    
    // Only update provided fields
    if (type !== undefined) updateData.type = type;
    if (serialNo !== undefined) updateData.serialNo = serialNo;
    if (location !== undefined) updateData.location = location;
    if (status !== undefined) updateData.status = status;
    if (manualLink !== undefined) updateData.manualLink = manualLink;
    if (imageLink !== undefined) updateData.imageLink = imageLink;
    if (installationDate !== undefined) updateData.installationDate = new Date(installationDate);
    if (manufacturer !== undefined) updateData.manufacturer = manufacturer;
    if (modelType !== undefined) updateData.modelType = modelType;
    if (operatingHours !== undefined) updateData.operatingHours = operatingHours;
    if (lastMaintenanceDate !== undefined) updateData.lastMaintenanceDate = new Date(lastMaintenanceDate);

    const updatedEquipment = await Equipment.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedEquipment) {
       res.status(404).json({ message: 'Equipment not found' });
       return;
    }

    res.json(updatedEquipment);
  } catch (err: any) {
    console.log("Error updating equipment:", err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE an equipment by ID
const deleteEquipment = async (req: Request, res: Response) => {
  try {
    const deletedEquipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!deletedEquipment) {
      res.status(404).json({ message: 'Equipment not found' });
      return
    }
    
    // Also delete related maintenance history
    await MaintenanceHistory.deleteMany({ equipment: req.params.id });
    
    res.json({ message: 'Equipment and related maintenance history deleted' });
  } catch (err: any) {
    console.log("Error deleting equipment:", err);
    res.status(400).json({ error: err.message });
  }
};

// POST maintenance report for equipment
const reportIssue = async (req: Request, res: Response) => {
  try {
    const { issue, technician, description } = req.body;
    
    if (!issue || !technician) {
      res.status(400).json({ error: 'Issue and technician are required fields' });
      return
    }

    const maintenanceHistory = new MaintenanceHistory({
      equipment: req.params.id,
      maintenanceDate: new Date(),
      issue,
      resolution: "Unknown",
      technician,
      description
    });

    // Update the equipment's status and last maintenance date
    const updatedEquipment = await Equipment.findByIdAndUpdate(req.params.id, {
      status: 'Under maintenance', // Using exact enum value
      lastMaintenanceDate: new Date(),
    }, { new: true });

    if (!updatedEquipment) {
      res.status(404).json({ message: 'Equipment not found' });
      return
    }

    await maintenanceHistory.save();
    res.status(201).json({
      maintenanceHistory,
      updatedEquipment
    });
  } catch (err: any) {
    console.log("Error reporting issue:", err);
    res.status(400).json({ error: err.message });
  }
};

// PATCH update operating hours
const updateOperatingHours = async (req: Request, res: Response) => {
  try {
    const { hours } = req.body;
    
    if (typeof hours !== 'number' || hours < 0) {
      return res.status(400).json({ error: 'Hours must be a positive number' });
    }

    const updatedEquipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { $inc: { operatingHours: hours } },
      { new: true }
    );

    if (!updatedEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json(updatedEquipment);
  } catch (err: any) {
    console.log("Error updating operating hours:", err);
    res.status(400).json({ error: err.message });
  }
};

export {
  getAllEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  reportIssue,
  getEquipmentById
};