const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getEmployees, getEmployee, addEmployee,
  updateEmployee, deleteEmployee, getOrgChart, uploadEmployeeDocument
} = require('../controllers/employeeController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/orgchart', protect, getOrgChart);
router.get('/', protect, getEmployees);
router.post('/:id/documents', protect, upload.single('document'), uploadEmployeeDocument);
router.get('/:id', protect, getEmployee);
router.post('/', protect, adminOnly, upload.single('profileImage'), addEmployee);
router.put('/:id', protect, adminOnly, upload.single('profileImage'), updateEmployee);
router.delete('/:id', protect, adminOnly, deleteEmployee);

module.exports = router;