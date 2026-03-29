const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getDesignations, addDesignation, updateDesignation, deleteDesignation
} = require('../controllers/designationController');

router.get('/', protect, getDesignations);
router.post('/', protect, adminOnly, addDesignation);
router.put('/:id', protect, adminOnly, updateDesignation);
router.delete('/:id', protect, adminOnly, deleteDesignation);

module.exports = router;
