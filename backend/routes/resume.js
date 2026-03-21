const express = require('express');
const router = express.Router();
const { uploadResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const { memoryUpload } = require('../config/cloudinary');

router.post('/upload', protect, memoryUpload.single('resume'), uploadResume);

module.exports = router;
