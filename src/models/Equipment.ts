import mongoose from 'mongoose';

// Equipment schema
const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Todo: add type of equipment
  location: { type: String, required: true },
  status: { type: String, required: true, enum: ['Operational', 'Under maintenance', 'Out of order'] },
  lastMaintenanceDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Equipment model
const Equipment = mongoose.model('Equipment', equipmentSchema);

export default Equipment;
