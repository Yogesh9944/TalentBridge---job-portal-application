const express = require('express');
const router = express.Router();
const { applyToJob, getMyApplications, getJobApplicants, updateApplicationStatus, analyzeResumeOnly } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const { memoryUpload } = require('../config/cloudinary');

router.post('/:jobId/apply', protect, authorize('seeker'), memoryUpload.single('resume'), applyToJob);
router.get('/my', protect, authorize('seeker'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplicants);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.post('/analyze', protect, memoryUpload.single('resume'), analyzeResumeOnly);

module.exports = router;
