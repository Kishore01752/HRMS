const Recruitment = require('../models/Recruitment');

// Get all jobs
const getJobs = async (req, res) => {
  try {
    const jobs = await Recruitment.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create job posting
const createJob = async (req, res) => {
  try {
    const n = Number(req.body.vacancies);
    const vacancies = Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;

    const job = await Recruitment.create({
      jobTitle: req.body.jobTitle,
      department: req.body.department,
      location: req.body.location,
      jobType: req.body.jobType || 'full-time',
      description: req.body.description,
      requirements: req.body.requirements,
      vacancies
    });
    res.status(201).json({ message: 'Job posted', job });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Update job
const updateJob = async (req, res) => {
  try {
    const job = await Recruitment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job updated', job });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    await Recruitment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add applicant to job
const addApplicant = async (req, res) => {
  try {
    const job = await Recruitment.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    job.applicants.push(req.body);
    await job.save();

    res.status(201).json({ message: 'Applicant added', job });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update applicant status
const updateApplicantStatus = async (req, res) => {
  try {
    const { status, interviewDate, notes } = req.body;
    const job = await Recruitment.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const applicant = job.applicants.id(req.params.applicantId);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    applicant.status = status;
    if (interviewDate) applicant.interviewDate = interviewDate;
    if (notes) applicant.notes = notes;

    await job.save();
    res.json({ message: 'Applicant updated', job });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getJobs, createJob, updateJob, deleteJob, addApplicant, updateApplicantStatus };