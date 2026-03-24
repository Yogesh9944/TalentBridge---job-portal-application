const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');

const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers, totalJobs, totalApplications, totalCompanies,
      seekers, recruiters, openJobs, pendingRecruiters,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Job.countDocuments(),
      Application.countDocuments(),
      Company.countDocuments(),
      User.countDocuments({ role: 'seeker' }),
      User.countDocuments({ role: 'recruiter' }),
      Job.countDocuments({ status: 'open' }),
      User.countDocuments({ role: 'recruiter', isApproved: false }),
    ]);


    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyUsers = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Most in-demand skills
    const topSkills = await Job.aggregate([
      { $match: { status: 'open' } },
      { $unwind: '$requiredSkills' },
      {
        $group: {
          _id: '$requiredSkills',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);


    const appStats = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, totalJobs, totalApplications, totalCompanies,
        seekers, recruiters, openJobs, pendingRecruiters,
        monthlyUsers, topSkills, appStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = { role: { $ne: 'admin' } };
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -notifications')
      .populate('company', 'name')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const approveRecruiter = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'recruiter') {
      return res.status(404).json({ success: false, message: 'Recruiter not found' });
    }

    user.isApproved = true;
    await user.save();

    await User.findByIdAndUpdate(user._id, {
      $push: {
        notifications: {
          message: 'Your recruiter account has been approved! You can now post jobs.',
          type: 'system',
          read: false,
          createdAt: new Date(),
        },
      },
    });

    res.json({ success: true, message: 'Recruiter approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getAllJobsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('company', 'name')
      .populate('postedBy', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, jobs, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const toggleJobApproval = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    job.isApproved = !job.isApproved;
    await job.save();

    res.json({ success: true, message: `Job ${job.isApproved ? 'approved' : 'unapproved'}`, isApproved: job.isApproved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAdminStats, getAllUsers, toggleBlockUser, approveRecruiter, deleteUser, getAllJobsAdmin, toggleJobApproval };
