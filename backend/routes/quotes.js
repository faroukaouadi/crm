const express = require('express');
const Quote = require('../models/Quote');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Company = require('../models/Company');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/quotes
// @desc    Get all quotes
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
        { quoteNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get quotes with pagination and populate
    const quotes = await Quote.find(filter)
      .populate('client', 'firstName lastName email company')
      .populate('company', 'name email')
      .populate('convertedToInvoice', 'invoiceNumber')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Quote.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        quotes,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quotes'
    });
  }
});

// @route   GET /api/quotes/:id
// @desc    Get single quote
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const quote = await Quote.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    })
    .populate('client', 'firstName lastName email phone company')
    .populate('company', 'name email phone address')
    .populate('convertedToInvoice', 'invoiceNumber status');
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }
    
    res.json({
      success: true,
      data: { quote }
    });
  } catch (error) {
    console.error('Get quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quote'
    });
  }
});

// @route   POST /api/quotes
// @desc    Create new quote
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const quoteData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    // Validate client exists
    const client = await Client.findOne({ 
      _id: quoteData.client, 
      createdBy: req.user._id 
    });
    
    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Set company from client
    quoteData.company = client.company;
    
    const quote = new Quote(quoteData);
    await quote.save();
    
    // Populate the created quote
    await quote.populate('client', 'firstName lastName email company');
    await quote.populate('company', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Quote created successfully',
      data: { quote }
    });
  } catch (error) {
    console.error('Create quote error:', error);
    
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
      message: 'Server error while creating quote'
    });
  }
});

// @route   PUT /api/quotes/:id
// @desc    Update quote
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const quote = await Quote.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    )
    .populate('client', 'firstName lastName email company')
    .populate('company', 'name email');
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Quote updated successfully',
      data: { quote }
    });
  } catch (error) {
    console.error('Update quote error:', error);
    
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
      message: 'Server error while updating quote'
    });
  }
});

// @route   DELETE /api/quotes/:id
// @desc    Delete quote
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const quote = await Quote.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Quote deleted successfully'
    });
  } catch (error) {
    console.error('Delete quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting quote'
    });
  }
});

// @route   PUT /api/quotes/:id/accept
// @desc    Accept quote
// @access  Private
router.put('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const quote = await Quote.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { 
        status: 'accepted',
        acceptanceDate: new Date(),
        updatedBy: req.user._id
      },
      { new: true, runValidators: true }
    )
    .populate('client', 'firstName lastName email company')
    .populate('company', 'name email');
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Quote accepted successfully',
      data: { quote }
    });
  } catch (error) {
    console.error('Accept quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while accepting quote'
    });
  }
});

// @route   PUT /api/quotes/:id/reject
// @desc    Reject quote
// @access  Private
router.put('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    const quote = await Quote.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { 
        status: 'rejected',
        rejectionReason: rejectionReason || 'No reason provided',
        updatedBy: req.user._id
      },
      { new: true, runValidators: true }
    )
    .populate('client', 'firstName lastName email company')
    .populate('company', 'name email');
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Quote rejected successfully',
      data: { quote }
    });
  } catch (error) {
    console.error('Reject quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting quote'
    });
  }
});

// @route   POST /api/quotes/:id/convert-to-invoice
// @desc    Convert quote to invoice
// @access  Private
router.post('/:id/convert-to-invoice', authMiddleware, async (req, res) => {
  try {
    const quote = await Quote.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }
    
    // Create invoice from quote
    const invoiceData = {
      client: quote.client,
      company: quote.company,
      issueDate: new Date(),
      dueDate: req.body.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'draft',
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      totalAmount: quote.totalAmount,
      currency: quote.currency,
      items: quote.items,
      notes: `Converted from quote ${quote.quoteNumber}`,
      paymentTerms: req.body.paymentTerms || 'Net 30',
      createdBy: req.user._id
    };
    
    const invoice = new Invoice(invoiceData);
    await invoice.save();
    
    // Update quote status
    quote.status = 'converted';
    quote.convertedToInvoice = invoice._id;
    quote.conversionDate = new Date();
    quote.updatedBy = req.user._id;
    await quote.save();
    
    // Populate the created invoice
    await invoice.populate('client', 'firstName lastName email company');
    await invoice.populate('company', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Quote converted to invoice successfully',
      data: { 
        invoice,
        quote: {
          ...quote.toObject(),
          convertedToInvoice: invoice
        }
      }
    });
  } catch (error) {
    console.error('Convert quote to invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while converting quote to invoice'
    });
  }
});

// @route   GET /api/quotes/stats/summary
// @desc    Get quote statistics
// @access  Private
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const totalQuotes = await Quote.countDocuments({ createdBy: req.user._id });
    
    const statusStats = await Quote.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const totalAmount = await Quote.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const acceptedAmount = await Quote.aggregate([
      { $match: { createdBy: req.user._id, status: 'accepted' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const expiredQuotes = await Quote.countDocuments({ 
      createdBy: req.user._id, 
      status: 'expired' 
    });
    
    const convertedQuotes = await Quote.countDocuments({ 
      createdBy: req.user._id, 
      status: 'converted' 
    });
    
    res.json({
      success: true,
      data: {
        totalQuotes,
        statusStats,
        totalAmount: totalAmount[0]?.total || 0,
        acceptedAmount: acceptedAmount[0]?.total || 0,
        expiredQuotes,
        convertedQuotes
      }
    });
  } catch (error) {
    console.error('Get quote stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quote statistics'
    });
  }
});

module.exports = router;
