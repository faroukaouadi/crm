const express = require('express');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Company = require('../models/Company');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/invoices
// @desc    Get all invoices
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, client, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = { createdBy: req.user._id };
    
    if (status) {
      filter.status = status;
    }
    
    if (client) {
      filter.client = client;
    }
    
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get invoices with pagination and populate
    const invoices = await Invoice.find(filter)
      .populate('client', 'firstName lastName email company')
      .populate('company', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Invoice.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching invoices'
    });
  }
});

// @route   GET /api/invoices/:id
// @desc    Get single invoice
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    })
    .populate('client', 'firstName lastName email phone company')
    .populate('company', 'name email phone address');
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.json({
      success: true,
      data: { invoice }
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching invoice'
    });
  }
});

// @route   POST /api/invoices
// @desc    Create new invoice
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const invoiceData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    // Validate client exists
    const client = await Client.findOne({ 
      _id: invoiceData.client, 
      createdBy: req.user._id 
    });
    
    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Set company from client
    invoiceData.company = client.company;
    
    const invoice = new Invoice(invoiceData);
    await invoice.save();
    
    // Populate the created invoice
    await invoice.populate('client', 'firstName lastName email company');
    await invoice.populate('company', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: { invoice }
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    
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
      message: 'Server error while creating invoice'
    });
  }
});

// @route   PUT /api/invoices/:id
// @desc    Update invoice
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    )
    .populate('client', 'firstName lastName email company')
    .populate('company', 'name email');
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: { invoice }
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    
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
      message: 'Server error while updating invoice'
    });
  }
});

// @route   DELETE /api/invoices/:id
// @desc    Delete invoice
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting invoice'
    });
  }
});

// @route   PUT /api/invoices/:id/mark-paid
// @desc    Mark invoice as paid
// @access  Private
router.put('/:id/mark-paid', authMiddleware, async (req, res) => {
  try {
    const { paidAmount, paymentMethod, paidDate } = req.body;
    
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { 
        status: 'paid',
        paidAmount: paidAmount || req.body.totalAmount,
        paymentMethod: paymentMethod || 'bank_transfer',
        paidDate: paidDate || new Date(),
        updatedBy: req.user._id
      },
      { new: true, runValidators: true }
    )
    .populate('client', 'firstName lastName email company')
    .populate('company', 'name email');
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Invoice marked as paid successfully',
      data: { invoice }
    });
  } catch (error) {
    console.error('Mark invoice paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking invoice as paid'
    });
  }
});

// @route   GET /api/invoices/stats/summary
// @desc    Get invoice statistics
// @access  Private
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const totalInvoices = await Invoice.countDocuments({ createdBy: req.user._id });
    
    const statusStats = await Invoice.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const totalAmount = await Invoice.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const paidAmount = await Invoice.aggregate([
      { $match: { createdBy: req.user._id, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } }
    ]);
    
    const overdueInvoices = await Invoice.countDocuments({ 
      createdBy: req.user._id, 
      status: 'overdue' 
    });
    
    res.json({
      success: true,
      data: {
        totalInvoices,
        statusStats,
        totalAmount: totalAmount[0]?.total || 0,
        paidAmount: paidAmount[0]?.total || 0,
        overdueInvoices
      }
    });
  } catch (error) {
    console.error('Get invoice stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching invoice statistics'
    });
  }
});

module.exports = router;
