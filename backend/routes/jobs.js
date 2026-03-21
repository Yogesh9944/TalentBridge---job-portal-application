const express = require('express');
const router = express.Router();
const { getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs, saveJob } = require('../controllers/jobController');
const { protect, authorize, requireApproval } = require('../middleware/auth');

router.get('/', getJobs);
router.get('/recruiter/my-jobs', protect, authorize('recruiter', 'admin'), getMyJobs);
router.get('/:id', getJob);
router.post('/', protect, authorize('recruiter', 'admin'), requireApproval, createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin', 'admin'), deleteJob);
router.put('/:id/save', protect, authorize('seeker'), saveJob);

module.exports = router;
