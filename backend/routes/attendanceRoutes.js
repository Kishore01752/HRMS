const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { clockIn, clockOut, getAttendance, getAllAttendance } = require('../controllers/attendanceController');

router.post('/clockin', protect, clockIn);
router.post('/clockout', protect, clockOut);
router.get('/all', protect, adminOnly, getAllAttendance);
router.get('/:employeeId', protect, getAttendance);

module.exports = router;
