const Employee = require('../models/Employee');
const Performance = require('../models/Performance');

const loadReview = async (req, res, next) => {
  try {
    const review = await Performance.findById(req.params.id).populate('employeeId', 'name department email reportingTo');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    req.review = review;
    next();
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

const isAdmin = (req) => req.user.role === 'admin';

const getMyEmployee = async (userId) => Employee.findOne({ userId });

const isReviewSubject = async (req) => {
  const emp = await getMyEmployee(req.user.id);
  if (!emp || !req.review) return false;
  return String(req.review.employeeId._id || req.review.employeeId) === String(emp._id);
};

const isReportingManager = async (req) => {
  const subject = await Employee.findById(req.review.employeeId._id || req.review.employeeId);
  if (!subject?.reportingTo) return false;
  const mgr = await Employee.findById(subject.reportingTo);
  return mgr && mgr.userId && String(mgr.userId) === String(req.user.id);
};

const requireSubjectOrAdmin = async (req, res, next) => {
  if (isAdmin(req)) return next();
  if (await isReviewSubject(req)) return next();
  return res.status(403).json({ message: 'Only the employee under review or admin' });
};

const requireManagerOrAdmin = async (req, res, next) => {
  if (isAdmin(req)) return next();
  if (await isReportingManager(req)) return next();
  return res.status(403).json({ message: 'Only the reporting manager or admin' });
};

const requireSubjectManagerOrAdminForGoals = async (req, res, next) => {
  if (isAdmin(req)) return next();
  if (await isReviewSubject(req)) return next();
  if (await isReportingManager(req)) return next();
  return res.status(403).json({ message: 'Not authorized to update goals' });
};

module.exports = {
  loadReview,
  requireSubjectOrAdmin,
  requireManagerOrAdmin,
  requireSubjectManagerOrAdminForGoals
};
