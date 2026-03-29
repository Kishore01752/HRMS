const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  type: {
    type: String,
    enum: ['national', 'festival', 'regional', 'company'],
    default: 'company'
  },
  region: { type: String, default: '' },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Holiday', holidaySchema);
