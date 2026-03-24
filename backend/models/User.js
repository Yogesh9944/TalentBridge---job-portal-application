const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['seeker', 'recruiter', 'admin'], default: 'seeker' },
  
  // Job Seeker Profile
  title: { type: String }, 
  bio: { type: String },
  phone: { type: String },
  location: { type: String },
  skills: [{ type: String }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startYear: Number,
    endYear: Number,
  }],
  experience: [{
    company: String,
    role: String,
    description: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
  }],
  resume: {
    url: String,
    publicId: String,
    originalName: String,
    uploadedAt: Date,
  },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  
  // Recruiter specific
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  
  // Admin controls
  isApproved: { type: Boolean, default: true }, // recruiters need approval
  isBlocked: { type: Boolean, default: false },
  
  // Notifications
  notifications: [{
    message: String,
    type: { type: String, enum: ['application', 'job', 'system', 'interview'] },
    read: { type: Boolean, default: false },
    link: String,
    createdAt: { type: Date, default: Date.now },
  }],
  
  profilePicture: { type: String },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
