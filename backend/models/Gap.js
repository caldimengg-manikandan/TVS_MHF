const mongoose = require('mongoose');

const gapSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  planId: { type: String, required: true },
  model: { type: String, required: true },
  gapAmount: { type: Number, required: true },
  reason: { type: String, required: true },
  priority: { type: String, required: true },
  status: { type: String, default: 'Open' },
  reportedBy: { type: String },
  reportedOn: { type: String },
  resolvedBy: { type: String },
  resolvedOn: { type: String },
  actionTaken: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Gap', gapSchema);