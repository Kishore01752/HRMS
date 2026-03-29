const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { computeMonthlyPayrollBreakdown, toFiniteNumber } = require('../utils/payrollTax');

// Generate payroll for an employee (monthly CTC on employee.salary)
const generatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year, bonus, allowances, otherDeductions } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const extraAllowances = toFiniteNumber(allowances);
    const extraBonus = toFiniteNumber(bonus);
    const extraDeductions = toFiniteNumber(otherDeductions);

    const breakdown = computeMonthlyPayrollBreakdown(
      toFiniteNumber(employee.salary),
      extraAllowances,
      extraBonus,
      extraDeductions
    );

    const { basicSalary, hra, providentFund, tax, grossSalary, netSalary } = breakdown;

    // Check if payroll already exists for this month
    const existing = await Payroll.findOne({ employeeId, month, year });
    if (existing) return res.status(400).json({ message: 'Payroll already generated for this month' });

    const payroll = await Payroll.create({
      employeeId, month, year,
      basicSalary, hra,
      allowances: extraAllowances,
      bonus: extraBonus,
      providentFund, tax,
      otherDeductions: extraDeductions,
      grossSalary, netSalary
    });

    res.status(201).json({ message: 'Payroll generated', payroll });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all payrolls (admin)
const getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate('employeeId', 'name department position')
      .sort({ createdAt: -1 });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get payrolls for one employee
const getMyPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find({ employeeId: req.params.employeeId })
      .sort({ year: -1, month: -1 });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark payroll as paid
const markAsPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidOn: new Date().toISOString().split('T')[0] },
      { new: true }
    );
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });
    res.json({ message: 'Marked as paid', payroll });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete payroll
const deletePayroll = async (req, res) => {
  try {
    await Payroll.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payroll deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { generatePayroll, getAllPayrolls, getMyPayrolls, markAsPaid, deletePayroll };