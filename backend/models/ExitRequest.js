const mongoose = require('mongoose');

const exitRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  lastWorkingDay: { type: String, required: true },
  reason: { type: String, default: '' },
  noticePeriodDays: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'withdrawn'],
    default: 'pending'
  },
  exitInterviewNotes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('ExitRequest', exitRequestSchema);
