const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
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
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
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
  paymentTerms: {
    type: String,
    default: 'Net 30',
    trim: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'check', 'bank_transfer', 'credit_card', 'paypal', 'other'],
    default: 'bank_transfer',
  },
  paidDate: {
    type: Date,
    default: null,
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative'],
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
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringFrequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
  },
  nextInvoiceDate: {
    type: Date,
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

// Virtual for days overdue
invoiceSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'overdue' && this.dueDate) {
    const today = new Date();
    const diffTime = today - this.dueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for payment status
invoiceSchema.virtual('paymentStatus').get(function() {
  if (this.status === 'paid') return 'Paid';
  if (this.status === 'overdue') return 'Overdue';
  if (this.paidAmount > 0 && this.paidAmount < this.totalAmount) return 'Partially Paid';
  return 'Unpaid';
});

// Pre-save middleware to calculate totals
invoiceSchema.pre('save', function(next) {
  // Calculate item totals
  this.items.forEach(item => {
    item.total = item.quantity * item.unitPrice;
  });
  
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate tax amount
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  
  // Calculate total amount
  this.totalAmount = this.subtotal + this.taxAmount;
  
  // Update updatedAt
  this.updatedAt = Date.now();
  
  // Check if invoice is overdue
  if (this.dueDate && new Date() > this.dueDate && this.status !== 'paid' && this.status !== 'cancelled') {
    this.status = 'overdue';
  }
  
  next();
});

// Pre-save middleware to generate invoice number
invoiceSchema.pre('save', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    try {
      // Get all existing invoice numbers
      const existingInvoices = await this.constructor.find({ invoiceNumber: { $exists: true, $ne: null } }, { invoiceNumber: 1 });
      
      let nextNumber = 1;
      if (existingInvoices.length > 0) {
        // Extract numbers and find the maximum
        const numbers = existingInvoices
          .map(inv => {
            const match = inv.invoiceNumber?.match(/INV-(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter(num => num > 0);
        
        if (numbers.length > 0) {
          nextNumber = Math.max(...numbers) + 1;
        }
      }
      
      // Find the next available unique invoice number
      let invoiceNumber = `INV-${String(nextNumber).padStart(6, '0')}`;
      let exists = await this.constructor.findOne({ invoiceNumber });
      
      // If number exists, increment until we find an available one
      while (exists && nextNumber < 999999) {
        nextNumber++;
        invoiceNumber = `INV-${String(nextNumber).padStart(6, '0')}`;
        exists = await this.constructor.findOne({ invoiceNumber });
      }
      
      if (nextNumber >= 999999) {
        return next(new Error('Unable to generate unique invoice number'));
      }
      
      this.invoiceNumber = invoiceNumber;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Indexes
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ client: 1 });
invoiceSchema.index({ company: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ issueDate: -1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ createdBy: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
