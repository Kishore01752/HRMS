const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewPeriod: { type: String, required: true }, // "Q1 2024"
  reviewType: { type: String, enum: ['quarterly', 'annual', 'probation'], default: 'quarterly' },

  // Goals / KPIs
  goals: [{
    title: { type: String },
    description: { type: String },
    target: { type: String },
    progress: { type: Number, default: 0 }, // 0-100%
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' }
  }],

  // Self Assessment
  selfAssessment: {
    strengths: { type: String },
    improvements: { type: String },
    comments: { type: String },
    rating: { type: Number, min: 1, max: 5 }
  },

  // Manager Review
  managerReview: {
    comments: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
  },

  // Final
  overallRating: { type: Number, min: 1, max: 5 },
  status: { type: String, enum: ['draft', 'self-review', 'manager-review', 'completed'], default: 'draft' },

  // 360° peer feedback (nominated reviewers)
  peerFeedback: [{
    reviewerName: { type: String, required: true },
    relationship: { type: String, default: 'peer' },
    rating: { type: Number, min: 1, max: 5 },
    comments: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now }
  }],

}, { timestamps: true });

module.exports = mongoose.model('Performance', performanceSchema);