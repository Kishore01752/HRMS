const Attendance = require('../models/Attendance');

// Clock in
const clockIn = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString();

    const existing = await Attendance.findOne({ employeeId, date: today });
    if (existing) return res.status(400).json({ message: 'Already clocked in today' });

    const record = await Attendance.create({ employeeId, date: today, clockIn: time });
    res.status(201).json({ message: 'Clocked in', record });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Clock out
const clockOut = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString();

    const record = await Attendance.findOneAndUpdate(
      { employeeId, date: today },
      { clockOut: time },
      { new: true }
    );

    if (!record) return res.status(404).json({ message: 'No clock-in found for today' });
    res.json({ message: 'Clocked out', record });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get attendance for an employee
const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ employeeId: req.params.employeeId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all attendance (admin)
const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().populate('employeeId', 'name department').sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { clockIn, clockOut, getAttendance, getAllAttendance };
