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

// Database connection with retry logic
const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected');
      return;
    } catch (err) {
      console.log(`DB connection attempt ${i + 1} failed:`, err.message);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
    }
  }
};

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.log('Failed to connect to database after retries:', err.message);
    process.exit(1);
  });
