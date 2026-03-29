const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  applyLeave, getMyLeaves, getAllLeaves,
  updateLeaveStatus, getLeaveBalance
} = require('../controllers/leaveController');

router.post('/', protect, applyLeave);
router.get('/all', protect, getAllLeaves);
router.get('/balance/:employeeId', protect, getLeaveBalance);
router.get('/:employeeId', protect, getMyLeaves);
router.put('/:id/status', protect, updateLeaveStatus);

module.exports = router;