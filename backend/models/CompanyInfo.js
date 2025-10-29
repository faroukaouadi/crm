const mongoose = require('mongoose');

const companyInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters']
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [20, 'Zip code cannot exceed 20 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters']
    }
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Email cannot exceed 100 characters'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  website: {
    type: String,
    trim: true,
    maxlength: [200, 'Website cannot exceed 200 characters']
  },
  taxId: {
    type: String,
    trim: true,
    maxlength: [50, 'Tax ID cannot exceed 50 characters']
  },
  registrationNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Registration number cannot exceed 50 characters']
  },
  logo: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    default: 'USD',
    trim: true,
    maxlength: [10, 'Currency cannot exceed 10 characters']
  },
  defaultPaymentTerms: {
    type: String,
    default: 'Net 30',
    trim: true,
    maxlength: [100, 'Payment terms cannot exceed 100 characters']
  },
  defaultQuoteTerms: {
    type: String,
    default: 'This quote is valid for 30 days from the issue date.',
    trim: true,
    maxlength: [1000, 'Quote terms cannot exceed 1000 characters']
  },
  footerNote: {
    type: String,
    trim: true,
    maxlength: [500, 'Footer note cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
companyInfoSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.zipCode,
    this.address.country
  ].filter(Boolean);
  return parts.join(', ');
});

// Index for better query performance
companyInfoSchema.index({ createdBy: 1 }, { unique: true });

// Ensure only one company info per user
companyInfoSchema.pre('save', function(next) {
  this.updatedBy = this.createdBy;
  next();
});

const CompanyInfo = mongoose.model('CompanyInfo', companyInfoSchema);

module.exports = CompanyInfo;
