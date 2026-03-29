const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/payroll', require('./routes/payrollRoutes'));
app.use('/api/performance', require('./routes/performanceRoutes'));
app.use('/api/recruitment', require('./routes/recruitmentRoutes'));
app.use('/api/holidays', require('./routes/holidayRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/designations', require('./routes/designationRoutes'));
app.use('/api/trainings', require('./routes/trainingRoutes'));
app.use('/api/exit', require('./routes/exitRoutes'));

app.get('/', (req, res) => {
  res.send('HRMS API is running...');
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.log('DB connection failed:', err.message);
  });
