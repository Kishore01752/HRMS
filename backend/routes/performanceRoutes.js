const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  loadReview,
  requireSubjectOrAdmin,
  requireManagerOrAdmin,
  requireSubjectManagerOrAdminForGoals
} = require('../middleware/performanceMiddleware');
const {
  createReview, getAllReviews, getMyReviews, getManagedReviews,
  submitSelfAssessment, submitManagerReview,
  updateGoalProgress, addPeerFeedback, deleteReview
} = require('../controllers/PerformanceController');

router.post('/', protect, adminOnly, createReview);
router.get('/all', protect, adminOnly, getAllReviews);
router.get('/team/reviews', protect, getManagedReviews);
router.put('/:id/self', protect, loadReview, requireSubjectOrAdmin, submitSelfAssessment);
router.put('/:id/manager', protect, loadReview, requireManagerOrAdmin, submitManagerReview);
router.put('/:id/goal', protect, loadReview, requireSubjectManagerOrAdminForGoals, updateGoalProgress);
router.post('/:id/peer', protect, loadReview, requireSubjectOrAdmin, addPeerFeedback);
router.delete('/:id', protect, adminOnly, deleteReview);
router.get('/:employeeId', protect, getMyReviews);

module.exports = router;
