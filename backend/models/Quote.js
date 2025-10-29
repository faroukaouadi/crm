const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  quoteNumber: {
    type: String,
    unique: true,
    trim: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required'],
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required'],
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now,
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required'],
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'],
    default: 'draft',
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative'],
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%'],
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative'],
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative'],
  },
  currency: {
    type: String,
    default: 'USD',
    trim: true,
  },
  items: [{
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative'],
    },
  }],
  notes: {
    type: String,
    trim: true,
  },
  terms: {
    type: String,
    default: 'This quote is valid for 30 days from the issue date.',
    trim: true,
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative'],
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  convertedToInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    default: null,
  },
  conversionDate: {
    type: Date,
    default: null,
  },
  rejectionReason: {
    type: String,
    trim: true,
  },
  acceptanceDate: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for days until expiry
quoteSchema.virtual('daysUntilExpiry').get(function() {
  if (this.validUntil) {
    const today = new Date();
    const diffTime = this.validUntil - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for quote status
quoteSchema.virtual('quoteStatus').get(function() {
  if (this.status === 'accepted') return 'Accepted';
  if (this.status === 'rejected') return 'Rejected';
  if (this.status === 'converted') return 'Converted to Invoice';
  if (this.status === 'expired') return 'Expired';
  if (this.status === 'sent') return 'Sent';
  return 'Draft';
});

// Pre-save middleware to calculate totals
quoteSchema.pre('save', function(next) {
  // Calculate item totals
  this.items.forEach(item => {
    item.total = item.quantity * item.unitPrice;
  });
  
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate discount amount
  if (this.discountType === 'percentage') {
    this.discountAmount = (this.subtotal * this.discount) / 100;
  } else {
    this.discountAmount = this.discount;
  }
  
  // Calculate subtotal after discount
  const subtotalAfterDiscount = this.subtotal - this.discountAmount;
  
  // Calculate tax amount
  this.taxAmount = (subtotalAfterDiscount * this.taxRate) / 100;
  
  // Calculate total amount
  this.totalAmount = subtotalAfterDiscount + this.taxAmount;
  
  // Update updatedAt
  this.updatedAt = Date.now();
  
  // Check if quote is expired
  if (this.validUntil && new Date() > this.validUntil && this.status !== 'accepted' && this.status !== 'rejected' && this.status !== 'converted') {
    this.status = 'expired';
  }
  
  next();
});

// Pre-save middleware to generate quote number
quoteSchema.pre('save', async function(next) {
  if (this.isNew && !this.quoteNumber) {
    const count = await this.constructor.countDocuments();
    this.quoteNumber = `QUO-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes
quoteSchema.index({ quoteNumber: 1 });
quoteSchema.index({ client: 1 });
quoteSchema.index({ company: 1 });
quoteSchema.index({ status: 1 });
quoteSchema.index({ issueDate: -1 });
quoteSchema.index({ validUntil: 1 });
quoteSchema.index({ createdBy: 1 });

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = Quote;
