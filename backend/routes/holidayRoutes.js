const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getHolidays, addHoliday, updateHoliday, deleteHoliday
} = require('../controllers/holidayController');

router.get('/', protect, getHolidays);
router.post('/', protect, adminOnly, addHoliday);
router.put('/:id', protect, adminOnly, updateHoliday);
router.delete('/:id', protect, adminOnly, deleteHoliday);

module.exports = router;
