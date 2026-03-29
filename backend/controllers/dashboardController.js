const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Expense = require('../models/Expense');
const Recruitment = require('../models/Recruitment');
const Holiday = require('../models/Holiday');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalEmployees = await Employee.countDocuments({ status: 'active' });

    const newThisMonth = await Employee.countDocuments({
      status: 'active',
      createdAt: { $gte: startOfMonth }
    });

    const presentToday = await Attendance.countDocuments({
      date: today,
      status: { $in: ['present', 'late', 'half-day'] }
    });

    const activeEmpCount = await Employee.countDocuments({ status: 'active' });
    const absentToday = Math.max(0, activeEmpCount - presentToday);

    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
    const approvedLeaves = await Leave.countDocuments({ status: 'approved' });

    const unpaidPayroll = await Payroll.countDocuments({ status: 'draft' });

    const pendingExpenses = await Expense.countDocuments({ status: 'pending' });

    const reimbursedAgg = await Expense.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenseReimbursed = reimbursedAgg[0]?.total || 0;

    const openJobs = await Recruitment.countDocuments({ status: 'open' });
    const jobsWithApplicants = await Recruitment.find({ status: 'open' }).select('applicants');
    const totalApplicants = jobsWithApplicants.reduce((s, j) => s + (j.applicants?.length || 0), 0);

    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);
    const endStr = in30.toISOString().split('T')[0];

    const upcomingHolidays = await Holiday.find({
      date: { $gte: today, $lte: endStr }
    })
      .sort({ date: 1 })
      .limit(20)
      .lean();

    const recentEmployees = await Employee.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name department createdAt')
      .lean();

    res.json({
      totalEmployees,
      newThisMonth,
      presentToday,
      absentToday,
      pendingLeaves,
      approvedLeaves,
      unpaidPayroll,
      pendingExpenses,
      openJobs,
      totalApplicants,
      upcomingHolidays,
      totalExpenseReimbursed,
      recentEmployees
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getDashboardStats };
