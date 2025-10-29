const express = require('express');
const CompanyInfo = require('../models/CompanyInfo');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/settings/company
// @desc    Get company information
// @access  Private
router.get('/company', authMiddleware, async (req, res) => {
  try {
    let companyInfo = await CompanyInfo.findOne({ createdBy: req.user._id });

    // If no company info exists, create default one
    if (!companyInfo) {
      companyInfo = new CompanyInfo({
        name: 'Your Company',
        address: {
          street: '123 Business Street',
          city: 'Business City',
          state: 'BC',
          zipCode: '12345',
          country: 'USA'
        },
        phone: '(555) 123-4567',
        email: 'info@yourcompany.com',
        currency: 'USD',
        defaultPaymentTerms: 'Net 30',
        defaultQuoteTerms: 'This quote is valid for 30 days from the issue date.',
        createdBy: req.user._id
      });
      await companyInfo.save();
    }

    res.json({
      success: true,
      data: { companyInfo }
    });
  } catch (error) {
    console.error('Get company info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching company information'
    });
  }
});

// @route   PUT /api/settings/company
// @desc    Update company information
// @access  Private
router.put('/company', authMiddleware, async (req, res) => {
  try {
    let companyInfo = await CompanyInfo.findOne({ createdBy: req.user._id });

    if (!companyInfo) {
      // Create new company info if it doesn't exist
      companyInfo = new CompanyInfo({
        ...req.body,
        createdBy: req.user._id,
        updatedBy: req.user._id
      });
    } else {
      // Update existing company info
      Object.assign(companyInfo, req.body);
      companyInfo.updatedBy = req.user._id;
    }

    await companyInfo.save();

    res.json({
      success: true,
      message: 'Company information updated successfully',
      data: { companyInfo }
    });
  } catch (error) {
    console.error('Update company info error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating company information'
    });
  }
});

module.exports = router;
