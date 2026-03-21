const express = require('express');
const router = express.Router();
const { createCompany, getMyCompany, updateCompany, uploadCompanyLogo, getAllCompanies } = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');
const { uploadLogo } = require('../config/cloudinary');

router.get('/', protect, authorize('admin'), getAllCompanies);
router.get('/my', protect, authorize('recruiter'), getMyCompany);
router.post('/', protect, authorize('recruiter'), createCompany);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateCompany);
router.put('/:id/logo', protect, authorize('recruiter'), uploadLogo.single('logo'), uploadCompanyLogo);

module.exports = router;
