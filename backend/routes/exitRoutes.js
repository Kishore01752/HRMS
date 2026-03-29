const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getExitRequests, submitExit, updateExit, deleteExit
} = require('../controllers/exitController');

router.get('/all', protect, adminOnly, getExitRequests);
router.post('/', protect, submitExit);
router.put('/:id', protect, adminOnly, updateExit);
router.delete('/:id', protect, adminOnly, deleteExit);

module.exports = router;
