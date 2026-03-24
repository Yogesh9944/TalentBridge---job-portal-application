const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const { extractSkills } = require('../utils/resumeParser');
const streamifier = require('streamifier');


const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume file uploaded' });
    }

    // Upload to Cloudinary
    const uploadFromBuffer = (buffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'job-portal/resumes',
            resource_type: 'raw',
            public_id: `resume_${req.user._id}_${Date.now()}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });
    };

    let resumeUrl = '';
    let publicId = '';

    try {
      const result = await uploadFromBuffer(req.file.buffer);
      resumeUrl = result.secure_url;
      publicId = result.public_id;
    } catch (cloudErr) {
      console.error('Cloudinary upload failed:', cloudErr.message);
      // If cloudinary fails, we still save some info
      resumeUrl = 'local';
    }

    // Update user's resume
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        resume: {
          url: resumeUrl,
          publicId,
          originalName: req.file.originalname,
          uploadedAt: new Date(),
        },
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resume: user.resume,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadResume };
