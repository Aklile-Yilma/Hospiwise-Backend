import mongoose from 'mongoose';

// Simple issue enums
const defibrillatorIssues = [
  'Battery Failure',
  'Electrode Malfunction', 
  'Charging Issues',
  'Shock Delivery Failure',
  'Software Error',
  'Power Supply Problem',
  'Display Not Working'
];

const infusionPumpIssues = [
  'Occlusion Detected',
  'Flow Rate Inaccurate',
  'Air-in-Line Alarm',
  'Battery Not Charging',
  'Pump Motor Error',
  'Keypad/Touchscreen Fault',
  'Alarm Not Functioning'
];

const patientMonitorIssues = [
  'ECG Lead Detachment',
  'SpO₂ Sensor Malfunction',
  'Display Flickering or Dead',
  'Inaccurate Readings',
  'Power Supply Issues',
  'Alarm Not Triggering',
  'Data Communication Failure'
];

const suctionMachineIssues = [
  'Low Suction Pressure',
  'Motor Overheating',
  'Tubing Blockage',
  'Canister Leak',
  'Filter Clogging',
  'Noisy Operation',
  'Power Switch Malfunction'
];

// All issues combined for simple enum
const allIssues = [
  ...defibrillatorIssues,
  ...infusionPumpIssues,
  ...patientMonitorIssues,
  ...suctionMachineIssues
];

// Simple maintenance history schema
const maintenanceHistorySchema = new mongoose.Schema({
  maintenanceId: {
    type: String,
    unique: true,
    default: function() {
      return 'MNT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  equipment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Equipment', 
    required: true 
  },
  issue: { 
    type: String, 
    required: true,
    enum: allIssues
  },
  description: { 
    type: String, 
    required: true
  },
  resolution: { 
    type: String, 
    required: true
  },
  technician: { 
    type: String, 
    required: true
  },
  maintenanceDate: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update timestamp before saving
maintenanceHistorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const MaintenanceHistory = mongoose.model('MaintenanceHistory', maintenanceHistorySchema);

// Export issue arrays for use in controller
export const issueEnums = {
  'Defibrillator': defibrillatorIssues,
  'Infusion Pump': infusionPumpIssues,
  'Patient Monitor': patientMonitorIssues,
  'Suction Machine': suctionMachineIssues
};

export default MaintenanceHistory;