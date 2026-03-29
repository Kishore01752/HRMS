const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  trainer: { type: String, default: '' },
  startDate: { type: String, required: true },
  endDate: { type: String, default: '' },
  location: { type: String, default: '' },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, { timestamps: true });

module.exports = mongoose.model('Training', trainingSchema);
