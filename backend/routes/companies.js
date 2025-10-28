const express = require('express');
const Company = require('../models/Company');
const Client = require('../models/Client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/companies
// @desc    Get all companies
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, industry, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = { createdBy: req.user._id };
    
    if (status) {
      filter.status = status;
    }
    
    if (industry) {
      filter.industry = { $regex: industry, $options: 'i' };
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get companies with pagination
    const companies = await Company.find(filter)
      .populate('clientCount')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Company.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        companies,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching companies'
    });
  }
});

// @route   GET /api/companies/:id
// @desc    Get single company
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const company = await Company.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    }).populate('clientCount');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    res.json({
      success: true,
      data: { company }
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching company'
    });
  }
});

// @route   POST /api/companies
// @desc    Create new company
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const companyData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const company = new Company(companyData);
    await company.save();
    
    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: { company }
    });
  } catch (error) {
    console.error('Create company error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating company'
    });
  }
});

// @route   PUT /api/companies/:id
// @desc    Update company
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Company updated successfully',
      data: { company }
    });
  } catch (error) {
    console.error('Update company error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating company'
    });
  }
});

// @route   DELETE /api/companies/:id
// @desc    Delete company
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Check if company has clients
    const clientCount = await Client.countDocuments({ company: req.params.id });
    
    if (clientCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete company. It has ${clientCount} client(s) associated with it. Please reassign or delete the clients first.`
      });
    }
    
    const company = await Company.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting company'
    });
  }
});

// @route   GET /api/companies/:id/clients
// @desc    Get clients for a specific company
// @access  Private
router.get('/:id/clients', authMiddleware, async (req, res) => {
  try {
    const clients = await Client.find({ 
      company: req.params.id,
      createdBy: req.user._id 
    }).populate('company', 'name');
    
    res.json({
      success: true,
      data: { clients }
    });
  } catch (error) {
    console.error('Get company clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching company clients'
    });
  }
});

// @route   GET /api/companies/stats/summary
// @desc    Get company statistics
// @access  Private
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments({ createdBy: req.user._id });
    
    const statusStats = await Company.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const industryStats = await Company.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const sizeStats = await Company.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: '$size', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalCompanies,
        statusStats,
        industryStats,
        sizeStats
      }
    });
  } catch (error) {
    console.error('Get company stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching company statistics'
    });
  }
});

module.exports = router;
