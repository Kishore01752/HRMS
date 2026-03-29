const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: String, required: true }, // "2024-01"
  year: { type: String, required: true },

  // Earnings
  basicSalary: { type: Number, default: 0 },
  hra: { type: Number, default: 0 },        // House Rent Allowance
  allowances: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },

  // Deductions
  providentFund: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  otherDeductions: { type: Number, default: 0 },

  // Final
  grossSalary: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },

  status: { type: String, enum: ['draft', 'paid'], default: 'draft' },
  paidOn: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);