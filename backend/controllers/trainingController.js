const Training = require('../models/Training');

const getTrainings = async (req, res) => {
  try {
    const list = await Training.find().populate('attendees', 'name department').sort({ startDate: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createTraining = async (req, res) => {
  try {
    const t = await Training.create(req.body);
    res.status(201).json({ message: 'Training scheduled', training: t });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const updateTraining = async (req, res) => {
  try {
    const t = await Training.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!t) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Updated', training: t });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTraining = async (req, res) => {
  try {
    await Training.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTrainings, createTraining, updateTraining, deleteTraining };
