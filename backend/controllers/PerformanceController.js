const Performance = require('../models/Performance');
const Employee = require('../models/Employee');

// Create performance review
const createReview = async (req, res) => {
  try {
    const review = await Performance.create(req.body);
    res.status(201).json({ message: 'Review created', review });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all reviews (admin)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Performance.find()
      .populate({
        path: 'employeeId',
        select: 'name department position reportingTo email',
        populate: { path: 'reportingTo', select: 'name userId' }
      })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get reviews for one employee
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Performance.find({ employeeId: req.params.employeeId })
      .populate({
        path: 'employeeId',
        select: 'name department position reportingTo email',
        populate: { path: 'reportingTo', select: 'name userId' }
      })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reviews for direct reports (manager view)
const getManagedReviews = async (req, res) => {
  try {
    const mgr = await Employee.findOne({ userId: req.user.id });
    if (!mgr) return res.json([]);
    const teamIds = await Employee.find({ reportingTo: mgr._id }).distinct('_id');
    const reviews = await Performance.find({ employeeId: { $in: teamIds } })
      .populate({
        path: 'employeeId',
        select: 'name department position reportingTo email',
        populate: { path: 'reportingTo', select: 'name userId' }
      })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update self assessment (employee under review)
const submitSelfAssessment = async (req, res) => {
  try {
    const review = await Performance.findByIdAndUpdate(
      req.params.id,
      {
        selfAssessment: req.body.selfAssessment,
        status: 'manager-review'
      },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Self assessment submitted', review });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Manager review (reporting manager or admin)
const submitManagerReview = async (req, res) => {
  try {
    const { managerReview, overallRating } = req.body;
    const mgrEmp = await Employee.findOne({ userId: req.user.id });

    const payload = {
      managerReview: {
        ...managerReview,
        reviewedBy: mgrEmp?._id
      },
      overallRating,
      status: 'completed'
    };

    const review = await Performance.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Manager review submitted', review });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update goal progress
const updateGoalProgress = async (req, res) => {
  try {
    const { goalIndex, progress, status } = req.body;
    const review = await Performance.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (!review.goals[goalIndex]) return res.status(400).json({ message: 'Invalid goal index' });

    review.goals[goalIndex].progress = progress;
    review.goals[goalIndex].status = status;
    await review.save();

    res.json({ message: 'Goal updated', review });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 360° peer entry (reviewee adds)
const addPeerFeedback = async (req, res) => {
  try {
    const { reviewerName, relationship, rating, comments } = req.body;
    const review = await Performance.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.peerFeedback.push({
      reviewerName,
      relationship: relationship || 'peer',
      rating: Number(rating),
      comments: comments || '',
      submittedAt: new Date()
    });
    await review.save();
    res.json({ message: 'Peer feedback recorded', review });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    await Performance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createReview, getAllReviews, getMyReviews, getManagedReviews,
  submitSelfAssessment, submitManagerReview,
  updateGoalProgress, addPeerFeedback, deleteReview
};