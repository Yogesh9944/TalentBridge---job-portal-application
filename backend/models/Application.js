const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  resume: {
    url: String,
    originalName: String,
    publicId: String,
  },
  
  coverLetter: { type: String },
  
  status: {
    type: String,
    enum: ['applied', 'under_review', 'shortlisted', 'rejected', 'selected'],
    default: 'applied',
  },
  
  // Resume Analysis Results
  analysis: {
    matchScore: { type: Number, default: 0 }, // 0-100
    matchedSkills: [String],
    missingSkills: [String],
    extractedSkills: [String],
    extractedText: String,
    strengths: [String],
    analyzed: { type: Boolean, default: false },
  },
  
  recruiterNote: { type: String },
  interviewDate: { type: Date },
  interviewTime: { type: String },
  interviewLink: { type: String },
  
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
