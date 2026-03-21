const Job = require('../models/Job');
const Company = require('../models/Company');
const User = require('../models/User');

// @GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const {
      search, location, locationType, salary_min, salary_max,
      experience, jobType, category, sort = '-createdAt', page = 1, limit = 12,
    } = req.query;

    const query = { status: 'open', isApproved: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (location) query.location = { $regex: location, $options: 'i' };
    if (locationType) query.locationType = locationType;
    if (experience) query.experienceLevel = experience;
    if (jobType) query.jobType = jobType;
    if (category) query.category = { $regex: category, $options: 'i' };
    if (salary_min) query['salary.min'] = { $gte: parseInt(salary_min) };
    if (salary_max) query['salary.max'] = { $lte: parseInt(salary_max) };

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('company', 'name logo location industry')
      .populate('postedBy', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      jobs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/jobs/:id
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name logo location description website industry size')
      .populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Increment views
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/jobs
const createJob = async (req, res) => {
  try {
    const company = await Company.findOne({ recruiter: req.user._id });
    if (!company) {
      return res.status(400).json({ success: false, message: 'Please create a company profile first' });
    }

    const {
      title, description, requirements, requiredSkills, location, locationType,
      salary, experienceLevel, experienceYears, jobType, category, deadline,
    } = req.body;

    const job = await Job.create({
      title,
      description,
      requirements,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills?.split(',').map(s => s.trim()),
      company: company._id,
      postedBy: req.user._id,
      location,
      locationType,
      salary,
      experienceLevel,
      experienceYears,
      jobType,
      category,
      deadline,
    });

    await job.populate('company', 'name logo location');

    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateData = { ...req.body };
    if (updateData.requiredSkills && !Array.isArray(updateData.requiredSkills)) {
      updateData.requiredSkills = updateData.requiredSkills.split(',').map(s => s.trim());
    }

    job = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('company', 'name logo location');

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await job.deleteOne();
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/jobs/recruiter/my-jobs
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .populate('company', 'name logo')
      .sort('-createdAt');

    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/jobs/:id/save
const saveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const jobId = req.params.id;

    const isSaved = user.savedJobs.includes(jobId);
    if (isSaved) {
      user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    } else {
      user.savedJobs.push(jobId);
    }

    await user.save();
    res.json({ success: true, saved: !isSaved, message: isSaved ? 'Job removed from saved' : 'Job saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs, saveJob };
