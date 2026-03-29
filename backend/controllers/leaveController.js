const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// Calculate days between two dates
const calcDays = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diff);
};

// Apply for leave
const applyLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;
    const totalDays = calcDays(startDate, endDate);

    const leave = await Leave.create({
      employeeId, leaveType, startDate,
      endDate, reason, totalDays
    });

    res.status(201).json({ message: 'Leave applied', leave });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get leaves for one employee
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.params.employeeId })
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: all | Manager: direct reports | Employee: own leaves only
const getAllLeaves = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const leaves = await Leave.find()
        .populate('employeeId', 'name department')
        .sort({ createdAt: -1 });
      return res.json(leaves);
    }

    const myEmp = await Employee.findOne({ userId: req.user.id });
    if (!myEmp) return res.json([]);

    const teamIds = await Employee.find({ reportingTo: myEmp._id }).distinct('_id');
    const filter = teamIds.length > 0
      ? { employeeId: { $in: teamIds } }
      : { employeeId: myEmp._id };

    const leaves = await Leave.find(filter)
      .populate('employeeId', 'name department')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve or reject (admin or reporting manager)
const updateLeaveStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    const emp = await Employee.findById(leave.employeeId);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    const isAdmin = req.user.role === 'admin';
    let isManager = false;
    if (!isAdmin && emp.reportingTo) {
      const mgr = await Employee.findById(emp.reportingTo);
      if (mgr && mgr.userId && String(mgr.userId) === String(req.user.id)) isManager = true;
    }
    if (!isAdmin && !isManager) {
      return res.status(403).json({ message: 'Only admin or reporting manager can approve or reject' });
    }

    const approverEmp = await Employee.findOne({ userId: req.user.id });
    const payload = { status, rejectionReason: rejectionReason || '' };
    if ((status === 'approved' || status === 'rejected') && approverEmp) {
      payload.approvedBy = approverEmp._id;
    }

    const updated = await Leave.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.json({ message: `Leave ${status}`, leave: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Leave balance for an employee
const getLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const year = new Date().getFullYear().toString();

    const leaves = await Leave.find({
      employeeId,
      status: 'approved',
      startDate: { $regex: `^${year}` }
    });

    // Default allowance per type per year
    const allowance = {
      sick: 10, casual: 12, annual: 15,
      paid: 12, unpaid: 0, maternity: 90, paternity: 5
    };

    const used = {};
    leaves.forEach(l => {
      used[l.leaveType] = (used[l.leaveType] || 0) + (l.totalDays || 1);
    });

    const balance = {};
    Object.keys(allowance).forEach(type => {
      balance[type] = {
        allowed: allowance[type],
        used: used[type] || 0,
        remaining: Math.max(0, allowance[type] - (used[type] || 0))
      };
    });

    res.json({ employeeId, year, balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  applyLeave, getMyLeaves, getAllLeaves,
  updateLeaveStatus, getLeaveBalance
};