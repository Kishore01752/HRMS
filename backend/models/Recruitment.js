const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  resumeUrl: { type: String },
  status: {
    type: String,
    enum: ['applied', 'screening', 'interview', 'offered', 'hired', 'rejected'],
    default: 'applied'
  },
  interviewDate: { type: String },
  notes: { type: String }
});

const recruitmentSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String },
  jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'], default: 'full-time' },
  description: { type: String },
  requirements: { type: String },
  vacancies: { type: Number, default: 1 },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  applicants: [applicantSchema]
}, { timestamps: true });

module.exports = mongoose.model('Recruitment', recruitmentSchema);