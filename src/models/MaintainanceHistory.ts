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

const ultrasoundIssues = [
  'Probe Failure',
  'Image Artifacts',
  'Poor Image Quality',
  'Calibration Drift',
  'Software Crash',
  'Power Supply Issue',
  'Display Unit Failure',
  'Transducer Malfunction'
];

const ctScannerIssues = [
  'X-ray Tube Failure',
  'Cooling System Failure',
  'Gantry Malfunction',
  'Detector Array Issue',
  'Calibration Drift',
  'Software Glitch',
  'Radiation Dose Error',
  'Power Supply Failure',
  'Table Movement Error'
];

const mriIssues = [
  'Magnet Quench',
  'RF Shielding Failure',
  'Cooling System Failure',
  'Gradient Coil Issue',
  'Helium Loss',
  'Calibration Drift',
  'Software Crash',
  'Shimming Problems',
  'Cryogenic System Failure'
];

const anesthesiaMachineIssues = [
  'Gas Leak',
  'Ventilator Failure',
  'Flow Meter Malfunction',
  'Vaporizer Issue',
  'Sensor Malfunction',
  'Calibration Error',
  'Power Failure',
  'Display Failure',
  'Breathing Circuit Problem'
];

const xrayIssues = [
  'X-ray Tube Failure',
  'Image Noise',
  'Poor Image Quality',
  'Cooling System Issue',
  'Detector Malfunction',
  'Calibration Error',
  'Power Supply Failure',
  'Software Error',
  'Collimator Problem'
];

// All issues combined for simple enum
const allIssues = [
  ...defibrillatorIssues,
  ...infusionPumpIssues,
  ...patientMonitorIssues,
  ...suctionMachineIssues,
  ...ultrasoundIssues,
  ...ctScannerIssues,
  ...mriIssues,
  ...anesthesiaMachineIssues,
  ...xrayIssues
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
  'Infusion pump': infusionPumpIssues,
  'Patient monitor': patientMonitorIssues,
  'Suction machine': suctionMachineIssues,
  'ULTRASOUND': ultrasoundIssues,
  'CTScanner': ctScannerIssues,
  'MRI': mriIssues,
  'Anesthesia Machine': anesthesiaMachineIssues,
  'XRAY': xrayIssues
};

export default MaintenanceHistory;