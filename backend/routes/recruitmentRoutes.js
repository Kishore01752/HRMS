const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getJobs, createJob, updateJob, deleteJob,
  addApplicant, updateApplicantStatus
} = require('../controllers/recruitmentController');

router.get('/', protect, getJobs);
router.post('/', protect, adminOnly, createJob);
router.put('/:id', protect, adminOnly, updateJob);
router.delete('/:id', protect, adminOnly, deleteJob);
router.post('/:id/applicants', protect, adminOnly, addApplicant);
router.put('/:jobId/applicants/:applicantId', protect, adminOnly, updateApplicantStatus);

module.exports = router;