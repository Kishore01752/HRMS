const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  submitExpense, getMyExpenses, getAllExpenses, updateExpenseStatus, deleteExpense
} = require('../controllers/expenseController');

router.post('/', protect, submitExpense);
router.get('/all', protect, adminOnly, getAllExpenses);
router.get('/employee/:employeeId', protect, getMyExpenses);
router.put('/:id/status', protect, adminOnly, updateExpenseStatus);
router.delete('/:id', protect, adminOnly, deleteExpense);

module.exports = router;
