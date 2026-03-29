const Department = require('../models/Department');

const getDepartments = async (req, res) => {
  try {
    const deps = await Department.find().populate('manager', 'name');
    res.json(deps);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addDepartment = async (req, res) => {
  try {
    const dep = await Department.create(req.body);
    res.status(201).json({ message: 'Department created', dep });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const dep = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Department updated', dep });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDepartments, addDepartment, updateDepartment, deleteDepartment };