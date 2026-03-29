const Holiday = require('../models/Holiday');

const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addHoliday = async (req, res) => {
  try {
    const h = await Holiday.create(req.body);
    res.status(201).json({ message: 'Holiday added', holiday: h });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const updateHoliday = async (req, res) => {
  try {
    const h = await Holiday.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!h) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Updated', holiday: h });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteHoliday = async (req, res) => {
  try {
    await Holiday.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getHolidays, addHoliday, updateHoliday, deleteHoliday };
