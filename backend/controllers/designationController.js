const Designation = require('../models/Designation');

const getDesignations = async (req, res) => {
  try {
    const list = await Designation.find().populate('reportsTo', 'title hierarchyLevel').sort({ hierarchyLevel: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addDesignation = async (req, res) => {
  try {
    const d = await Designation.create(req.body);
    res.status(201).json({ message: 'Created', designation: d });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const updateDesignation = async (req, res) => {
  try {
    const d = await Designation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!d) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Updated', designation: d });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteDesignation = async (req, res) => {
  try {
    await Designation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDesignations, addDesignation, updateDesignation, deleteDesignation };
