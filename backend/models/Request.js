const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  model: { type: String, required: true },
  quantity: { type: Number, required: true },
  priority: { type: String, required: true },
  justification: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  requestedBy: { type: String },
  requestedOn: { type: String },
  reviewedBy: { type: String },
  reviewedOn: { type: String },
  comments: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);