const express = require('express');
const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper function to calculate totalValue from invoices
async function calculateClientTotalValue(clientId) {
  try {
    const result = await Invoice.aggregate([
      { $match: { client: clientId } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
  } catch (error) {
    console.error('Error calculating totalValue:', error);
    return 0;
  }
}

// @route   GET /api/clients
// @desc    Get all clients
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = { createdBy: req.user._id };
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const clients = await Client.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('company', 'name email phone')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    // Calculate totalValue for each client from their invoices
    const clientsWithTotalValue = await Promise.all(
      clients.map(async (client) => {
        const totalValue = await calculateClientTotalValue(client._id);
        const clientObj = client.toObject();
        clientObj.totalValue = totalValue;
        return clientObj;
      })
    );

    const total = await Client.countDocuments(filter);

    res.json({
      success: true,
      data: {
        clients: clientsWithTotalValue,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during clients retrieval'
    });
  }
});

// @route   GET /api/clients/:id
// @desc    Get single client
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    })
    .populate('company', 'name email phone address')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Calculate totalValue from invoices
    const totalValue = await calculateClientTotalValue(client._id);
    const clientObj = client.toObject();
    clientObj.totalValue = totalValue;

    res.json({
      success: true,
      data: { client: clientObj }
    });

  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during client retrieval'
    });
  }
});

// @route   POST /api/clients
// @desc    Create new client
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Remove totalValue from body - it's calculated from invoices
    const { totalValue, ...clientDataWithoutTotal } = req.body;
    
    const clientData = {
      ...clientDataWithoutTotal,
      createdBy: req.user._id,
      totalValue: 0 // Set to 0 initially, will be calculated from invoices
    };

    const client = new Client(clientData);
    await client.save();

    await client.populate('company', 'name email phone');
    await client.populate('createdBy', 'firstName lastName email');

    // Calculate totalValue from invoices (will be 0 for new client)
    const calculatedTotalValue = await calculateClientTotalValue(client._id);
    const clientObj = client.toObject();
    clientObj.totalValue = calculatedTotalValue;

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: { client: clientObj }
    });

  } catch (error) {
    console.error('Create client error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during client creation'
    });
  }
});

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Remove totalValue from body - it's calculated from invoices
    const { totalValue, ...updateDataWithoutTotal } = req.body;
    
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { 
        ...updateDataWithoutTotal,
        updatedBy: req.user._id,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
    .populate('company', 'name email phone address')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Calculate totalValue from invoices
    const calculatedTotalValue = await calculateClientTotalValue(client._id);
    const clientObj = client.toObject();
    clientObj.totalValue = calculatedTotalValue;

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: { client: clientObj }
    });

  } catch (error) {
    console.error('Update client error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during client update'
    });
  }
});

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });

  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during client deletion'
    });
  }
});

// @route   GET /api/clients/stats/summary
// @desc    Get client statistics
// @access  Private
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await Client.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          activeClients: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
          prospectClients: { $sum: { $cond: [{ $eq: ['$status', 'Prospect'] }, 1, 0] } },
          totalValue: { $sum: '$totalValue' },
          totalDeals: { $sum: '$deals' }
        }
      }
    ]);

    const result = stats[0] || {
      totalClients: 0,
      activeClients: 0,
      prospectClients: 0,
      totalValue: 0,
      totalDeals: 0
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get client stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during stats retrieval'
    });
  }
});

module.exports = router;
