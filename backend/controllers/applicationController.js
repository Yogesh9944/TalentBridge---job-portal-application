const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { analyzeResume } = require('../utils/resumeParser');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper: add notification to user
const addNotification = async (userId, message, type, link = '') => {
  await User.findByIdAndUpdate(userId, {
    $push: {
      notifications: {
        $each: [{ message, type, link, createdAt: new Date() }],
        $position: 0,
        $slice: 50, // keep last 50 notifications
      },
    },
  });
};

// Upload buffer to Cloudinary as raw file
const uploadToCloudinary = (buffer, fileName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'job-portal/resumes',
        resource_type: 'raw',
        public_id: `resume_${Date.now()}_${fileName.replace(/\s/g, '_')}`,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// @POST /api/applications/:jobId/apply
const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('postedBy company');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.status !== 'open') return res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });

    // Check duplicate
    const existingApp = await Application.findOne({ job: job._id, applicant: req.user._id });
    if (existingApp) {
      return res.status(400).json({ success: false, message: 'You have already applied to this job' });
    }

    let resumeData = {};
    let analysisResult = {};

    // Handle resume upload
    if (req.file) {
      try {
        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        resumeData = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          originalName: req.file.originalname,
        };

        // Analyze resume
        analysisResult = await analyzeResume(req.file.buffer, job.requiredSkills);
      } catch (uploadError) {
        console.error('Upload/Analysis error:', uploadError.message);
        // Continue without cloud upload - use user's existing resume
      }
    } else {
      // Use user's saved resume
      const user = await User.findById(req.user._id);
      if (user.resume?.url) {
        resumeData = user.resume;
      } else {
        return res.status(400).json({ success: false, message: 'Please upload a resume to apply' });
      }
    }

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      resume: resumeData,
      coverLetter: req.body.coverLetter,
      analysis: analysisResult.analyzed ? analysisResult : undefined,
    });

    // Update job application count
    await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });

    // Save resume to user profile if not already saved
    const user = await User.findById(req.user._id);
    if (!user.resume?.url && resumeData.url) {
      await User.findByIdAndUpdate(req.user._id, {
        resume: { ...resumeData, uploadedAt: new Date() },
      });
    }

    // Notify recruiter
    await addNotification(
      job.postedBy._id,
      `New application for "${job.title}" from ${req.user.name}`,
      'application',
      `/recruiter/jobs/${job._id}/applicants`
    );

    await application.populate([
      { path: 'job', select: 'title company', populate: { path: 'company', select: 'name' } },
      { path: 'applicant', select: 'name email' },
    ]);

    res.status(201).json({ success: true, application, message: 'Application submitted successfully!' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied to this job' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/applications/my (seeker's applications)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: 'job',
        select: 'title location salary jobType status experienceLevel',
        populate: { path: 'company', select: 'name logo location' },
      })
      .sort('-createdAt');

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/applications/job/:jobId (recruiter views applicants)
const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { sort = '-createdAt', status, minScore } = req.query;
    const query = { job: req.params.jobId };
    if (status) query.status = status;
    if (minScore) query['analysis.matchScore'] = { $gte: parseInt(minScore) };

    const applications = await Application.find(query)
      .populate('applicant', 'name email phone location skills title education experience profilePicture')
      .sort(sort === 'score' ? { 'analysis.matchScore': -1 } : sort);

    res.json({ success: true, applications, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/applications/:id/status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, recruiterNote, interviewDate, interviewTime, interviewLink } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('job', 'title postedBy')
      .populate('applicant', 'name email');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (application.job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = status;
    if (recruiterNote) application.recruiterNote = recruiterNote;
    if (interviewDate) application.interviewDate = interviewDate;
    if (interviewTime) application.interviewTime = interviewTime;
    if (interviewLink) application.interviewLink = interviewLink;
    await application.save();

    // Notify applicant
    const statusMessages = {
      under_review: `Your application for "${application.job.title}" is now under review`,
      shortlisted: `🎉 You've been shortlisted for "${application.job.title}"!`,
      rejected: `Your application for "${application.job.title}" was not selected`,
      selected: `🎊 Congratulations! You've been selected for "${application.job.title}"!`,
    };

    if (statusMessages[status]) {
      await addNotification(
        application.applicant._id,
        statusMessages[status],
        'application',
        '/seeker/applications'
      );
    }

    res.json({ success: true, application, message: 'Application status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/applications/analyze-resume
const analyzeResumeOnly = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume file uploaded' });
    }

    const { jobSkills } = req.body;
    const skills = jobSkills ? (Array.isArray(jobSkills) ? jobSkills : jobSkills.split(',').map(s => s.trim())) : [];

    const analysis = await analyzeResume(req.file.buffer, skills);

    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { applyToJob, getMyApplications, getJobApplicants, updateApplicationStatus, analyzeResumeOnly };
