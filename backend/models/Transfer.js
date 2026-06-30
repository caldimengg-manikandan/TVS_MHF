const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  planId: { type: String, required: true },
  model: { type: String, required: true },
  fromLine: { type: String, required: true },
  toLine: { type: String, required: true },
  quantity: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  requestedBy: { type: String },
  requestedOn: { type: String },
  approvedBy: { type: String },
  approvedOn: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transfer', transferSchema);