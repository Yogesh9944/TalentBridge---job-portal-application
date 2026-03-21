const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  website: { type: String },
  location: { type: String },
  industry: { type: String },
  size: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'] },
  logo: {
    url: { type: String, default: '' },
    publicId: String,
  },
  founded: { type: Number },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
