import mongoose from 'mongoose';

// Equipment schema
const equipmentSchema = new mongoose.Schema({
  id: { 
    type: String, 
    unique: true,
    required: true
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['Defibrillator', 'Infusion pump', 'Patient monitor', 'Suction machine'] 
  },
  name: { 
    type: String, 
    required: true 
  },
  serialNo: { 
    type: String, 
    required: true,
    unique: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['Operational', 'Under maintenance', 'Out of order'] 
  },
  manualLink: { 
    type: String,
    validate: {
      validator: function(v: any) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Manual link must be a valid URL'
    }
  },
  imageLink: { 
    type: String,
    validate: {
      validator: function(v: any) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Image link must be a valid URL'
    }
  },
  installationDate: { 
    type: Date,
    required: true 
  },
  manufacturer: { 
    type: String, 
    required: true 
  },
  modelType: { 
    type: String, 
    required: true 
  },
  operatingHours: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  lastMaintenanceDate: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Pre-save middleware to generate custom ID and set name
equipmentSchema.pre('save', function(next) {
  if (this.isNew && !this.id) {
    // Generate random 6-digit number
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    
    // Create type prefix (first 3 letters of type)
    let typePrefix = '';
    switch(this.type) {
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
    
    this.id = `${typePrefix}_${randomDigits}`;
    this.name = this.id; // Set name exactly same as id
  }
  next();
});

// Index for better query performance
equipmentSchema.index({ type: 1, status: 1 });
equipmentSchema.index({ location: 1 });

const Equipment = mongoose.model('Equipment', equipmentSchema);

export default Equipment;