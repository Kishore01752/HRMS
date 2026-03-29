const Expense = require('../models/Expense');

const submitExpense = async (req, res) => {
  try {
    const { employeeId, amount, category, description } = req.body;
    const exp = await Expense.create({
      employeeId, amount, category, description, status: 'pending'
    });
    res.status(201).json({ message: 'Expense submitted', expense: exp });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const getMyExpenses = async (req, res) => {
  try {
    const list = await Expense.find({ employeeId: req.params.employeeId })
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const list = await Expense.find()
      .populate('employeeId', 'name department email')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateExpenseStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const exp = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        status,
        rejectionReason: rejectionReason || '',
        approvedBy: status === 'approved' ? req.user.id : undefined
      },
      { new: true }
    );
    if (!exp) return res.status(404).json({ message: 'Not found' });
    res.json({ message: `Expense ${status}`, expense: exp });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitExpense, getMyExpenses, getAllExpenses, updateExpenseStatus, deleteExpense
};
