const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address'],
  },
  phone: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
  },
  size: {
    type: String,
    enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
    default: 'small',
  },
  description: {
    type: String,
    trim: true,
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect', 'lead'],
    default: 'prospect',
  },
  revenue: {
    type: Number,
    default: 0,
  },
  employees: {
    type: Number,
    default: 0,
  },
  foundedYear: {
    type: Number,
  },
  socialMedia: {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    facebook: { type: String, trim: true },
  },
  tags: [{
    type: String,
    trim: true,
  }],
  notes: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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

// Virtual for full address
companySchema.virtual('fullAddress').get(function() {
  const address = this.address;
  if (!address) return '';
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Virtual for client count
companySchema.virtual('clientCount', {
  ref: 'Client',
  localField: '_id',
  foreignField: 'company',
  count: true
});

// Update updatedAt field on save
companySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
companySchema.index({ name: 1 });
companySchema.index({ email: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ status: 1 });
companySchema.index({ createdBy: 1 });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
