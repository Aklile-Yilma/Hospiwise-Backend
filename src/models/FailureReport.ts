import mongoose from 'mongoose';

const failureReportSchema = new mongoose.Schema({
  failureId: {
    type: String,
    unique: true,
    required: true
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  issue: {
    type: String,
    required: true,
    // This will be validated against the same issue enums as maintenance history
  },
  description: {
    type: String,
    required: true
  },
  reportedBy: {
    type: String,
    required: true
  },
  reportedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  severity: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['Reported', 'In Progress', 'Pending Parts', 'Awaiting Technician', 'Resolved'],
    default: 'Reported'
  },
  assignedTechnician: {
    type: String
  },
  estimatedRepairTime: {
    type: Date
  },
  actualStartTime: {
    type: Date
  },
  notes: [{
    note: String,
    addedBy: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  images: [{
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to generate custom failure ID and update timestamps
failureReportSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  if (this.isNew && !this.failureId) {
    // Generate failure ID: FR-YYYYMMDD-XXXXX
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    this.failureId = `FR-${dateStr}-${randomNum}`;
  }
  next();
});

// Index for better query performance
failureReportSchema.index({ equipment: 1, status: 1 });
failureReportSchema.index({ reportedDate: -1 });
failureReportSchema.index({ severity: 1, status: 1 });
failureReportSchema.index({ assignedTechnician: 1 });

const FailureReport = mongoose.model('FailureReport', failureReportSchema);

export default FailureReport;