const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  hierarchyLevel: { type: Number, required: true },
  department: { type: String, default: '' },
  reportsTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Designation', designationSchema);
