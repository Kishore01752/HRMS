const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Basic Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  dateOfBirth: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  profileImage: { type: String, default: '' },

  // Job Info
  department: { type: String },
  designation: { type: String },
  position: { type: String },
  employeeId: { type: String, unique: true, sparse: true },
  joiningDate: { type: Date },
  salary: { type: Number },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  reportingTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },

  // Cost Center
  costCenter: { type: String },

  // Emergency Contact
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String }
  },

  // Skills
  skills: [{ type: String }],

  // Employment History
  employmentHistory: [{
    company: { type: String },
    position: { type: String },
    from: { type: String },
    to: { type: String }
  }],

  // Documents & Certifications
  documents: [{
    name: { type: String },
    type: { type: String, enum: ['certification', 'id', 'contract', 'other'], default: 'other' },
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],

}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);