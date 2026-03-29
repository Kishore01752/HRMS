const ExitRequest = require('../models/ExitRequest');
const Employee = require('../models/Employee');

const getExitRequests = async (req, res) => {
  try {
    const list = await ExitRequest.find()
      .populate('employeeId', 'name department email')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const submitExit = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      const emp = await Employee.findById(req.body.employeeId);
      if (!emp || String(emp.userId) !== String(req.user.id)) {
        return res.status(403).json({ message: 'You can only submit an exit request for your own employee profile' });
      }
    }
    const ex = await ExitRequest.create({ ...req.body, status: 'pending' });
    res.status(201).json({ message: 'Exit request submitted', exit: ex });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const updateExit = async (req, res) => {
  try {
    const ex = await ExitRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ex) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Updated', exit: ex });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteExit = async (req, res) => {
  try {
    await ExitRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getExitRequests, submitExit, updateExit, deleteExit };
