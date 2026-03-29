const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true }, // stored as "YYYY-MM-DD"
  clockIn: { type: String },
  clockOut: { type: String },
  status: { type: String, enum: ['present', 'absent', 'half-day'], default: 'present' },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
