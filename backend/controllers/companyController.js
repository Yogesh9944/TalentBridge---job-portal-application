const Company = require('../models/Company');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @POST /api/companies
const createCompany = async (req, res) => {
  try {
    const existing = await Company.findOne({ recruiter: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have a company profile. Please update it.' });
    }

    const { name, description, website, location, industry, size, founded } = req.body;

    const company = await Company.create({
      name, description, website, location, industry, size, founded,
      recruiter: req.user._id,
    });

    // Link company to user
    await User.findByIdAndUpdate(req.user._id, { company: company._id });

    res.status(201).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/companies/my
const getMyCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ recruiter: req.user._id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'No company profile found' });
    }
    res.json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/companies/:id
const updateCompany = async (req, res) => {
  try {
    let company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    if (company.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/companies/:id/logo
const uploadCompanyLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });

    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    // Delete old logo
    if (company.logo?.publicId) {
      await cloudinary.uploader.destroy(company.logo.publicId);
    }

    company.logo = {
      url: req.file.path,
      publicId: req.file.filename,
    };
    await company.save();

    res.json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate('recruiter', 'name email')
      .sort('-createdAt');
    res.json({ success: true, companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createCompany, getMyCompany, updateCompany, uploadCompanyLogo, getAllCompanies };
