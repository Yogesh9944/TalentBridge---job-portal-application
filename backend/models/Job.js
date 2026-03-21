const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requirements: { type: String },
  requiredSkills: [{ type: String }],
  
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  location: { type: String, required: true },
  locationType: { type: String, enum: ['remote', 'onsite', 'hybrid'], default: 'onsite' },
  
  salary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'INR' },
    period: { type: String, enum: ['monthly', 'yearly'], default: 'yearly' },
  },
  
  experienceLevel: {
    type: String,
    enum: ['fresher', 'junior', 'mid', 'senior', 'lead'],
    default: 'mid',
  },
  experienceYears: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 10 },
  },
  
  jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'], default: 'full-time' },
  category: { type: String },
  
  status: { type: String, enum: ['open', 'closed', 'draft'], default: 'open' },
  deadline: { type: Date },
  
  applicationsCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

// Text index for search
jobSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
