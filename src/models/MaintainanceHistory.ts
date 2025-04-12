import mongoose from 'mongoose';

const issueEnum = {
    OVERHEATING: 'Overheating - The equipment is generating excessive heat and may shut down.',
    BATTERY_FAILURE: 'Battery failure - The equipment fails to operate due to a dead or faulty battery.',
    DISPLAY_ERROR: 'Display error - The screen is not displaying any information or has artifacts.',
    NETWORK_ISSUE: 'Network issue - The equipment cannot connect to the network or server.',
    MECHANICAL_FAILURE: 'Mechanical failure - A mechanical part of the equipment is malfunctioning.',
    OTHER: 'Other - Any other unclassified issue.',
  };

// Maintenance history schema
const maintenanceHistorySchema = new mongoose.Schema({
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  maintenanceDate: { type: Date, required: true },
  issue: { 
    type: String, 
    required: true, 
    enum: Object.keys(issueEnum), // Use enum for issue types
  },
  description: { type: String, required: true }, // Separate description field for issue details
  resolution: { type: String, required: true },
  technician: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Maintenance history model
const MaintenanceHistory = mongoose.model('MaintenanceHistory', maintenanceHistorySchema);

export default MaintenanceHistory;
