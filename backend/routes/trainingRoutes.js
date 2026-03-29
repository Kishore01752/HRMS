const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getTrainings, createTraining, updateTraining, deleteTraining
} = require('../controllers/trainingController');

router.get('/', protect, getTrainings);
router.post('/', protect, adminOnly, createTraining);
router.put('/:id', protect, adminOnly, updateTraining);
router.delete('/:id', protect, adminOnly, deleteTraining);

module.exports = router;
