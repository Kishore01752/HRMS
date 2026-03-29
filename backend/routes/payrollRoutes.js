const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  generatePayroll, getAllPayrolls, getMyPayrolls, markAsPaid, deletePayroll
} = require('../controllers/payrollController');
const { generatePayslip } = require('../controllers/payslipController');

router.post('/generate', protect, adminOnly, generatePayroll);
router.get('/all', protect, adminOnly, getAllPayrolls);
// More specific paths before generic `/:employeeId`
router.get('/:id/payslip', protect, generatePayslip);
router.put('/:id/pay', protect, adminOnly, markAsPaid);
router.delete('/:id', protect, adminOnly, deletePayroll);
router.get('/:employeeId', protect, getMyPayrolls);

module.exports = router;