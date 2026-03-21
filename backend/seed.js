/**
 * Seed script — creates an admin user in MongoDB
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');
};

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  isApproved: Boolean,
  isBlocked: { type: Boolean, default: false },
  notifications: [],
  skills: [],
  education: [],
  experience: [],
  savedJobs: [],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const seed = async () => {
  await connectDB();

  const existing = await User.findOne({ email: 'admin@tb.com' });
  if (existing) {
    console.log('ℹ️  Admin already exists: admin@tb.com');
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash('admin123', salt);

  await User.create({
    name: 'TalentBridge Admin',
    email: 'admin@tb.com',
    password: hashed,
    role: 'admin',
    isApproved: true,
    isBlocked: false,
    notifications: [],
    skills: [],
    education: [],
    experience: [],
    savedJobs: [],
  });

  console.log('\n✅ Admin user created!');
  console.log('📧 Email:    admin@tb.com');
  console.log('🔑 Password: admin123');
  console.log('\n⚠️  Please change the password after first login.\n');
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
