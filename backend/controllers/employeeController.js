const Employee = require('../models/Employee');

/**
 * Multer multipart fields are strings. Nested data is sent as JSON strings.
 * Empty reportingTo/salary/etc. must not be passed as "" or Mongoose throws CastError.
 */
const parseEmployeeFormBody = (body) => {
  const out = { ...body };

  Object.keys(out).forEach((k) => {
    const v = out[k];
    if (v === 'undefined' || v === 'null') delete out[k];
  });

  ['emergencyContact', 'skills', 'employmentHistory'].forEach((key) => {
    const val = out[key];
    if (typeof val === 'string' && val.trim()) {
      try {
        out[key] = JSON.parse(val);
      } catch {
        delete out[key];
      }
    }
  });

  if (out.reportingTo === '' || out.reportingTo === 'null' || out.reportingTo === 'undefined') {
    out.reportingTo = null;
  }

  if (out.salary === '' || out.salary === undefined || out.salary === null) {
    delete out.salary;
  } else {
    const n = Number(out.salary);
    if (Number.isNaN(n)) delete out.salary;
    else out.salary = n;
  }

  ['joiningDate', 'dateOfBirth', 'gender', 'employeeId', 'costCenter', 'address', 'phone'].forEach((key) => {
    if (out[key] === '') delete out[key];
  });

  return out;
};

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Flat list with reportingTo populated (for org chart tree on frontend)
const getOrgChart = async (req, res) => {
  try {
    const employees = await Employee.find().populate('reportingTo', 'name position department');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single employee
const getEmployee = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add employee
const addEmployee = async (req, res) => {
  try {
    const parsed = parseEmployeeFormBody(req.body);
    const profileImage = req.file ? `/uploads/${req.file.filename}` : '';
    const payload = { ...parsed, profileImage };

    const emp = await Employee.create(payload);

    res.status(201).json({ message: 'Employee added', employee: emp });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const updates = parseEmployeeFormBody(req.body);
    if (req.file) updates.profileImage = `/uploads/${req.file.filename}`;

    const emp = await Employee.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    res.json({ message: 'Employee updated', employee: emp });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const emp = await Employee.findByIdAndDelete(req.params.id);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload certification / document file
const uploadEmployeeDocument = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    if (req.user.role !== 'admin') {
      if (!emp.userId || String(emp.userId) !== String(req.user.id)) {
        return res.status(403).json({ message: 'You can only upload documents for your own profile' });
      }
    }

    if (!req.file) return res.status(400).json({ message: 'File required' });

    emp.documents.push({
      name: req.body.name || req.file.originalname,
      type: req.body.docType || 'other',
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date()
    });
    await emp.save();
    res.json({ message: 'Document uploaded', employee: emp });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

module.exports = {
  getEmployees,
  getOrgChart,
  getEmployee,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  uploadEmployeeDocument
};
