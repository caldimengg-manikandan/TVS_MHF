const mongoose = require('mongoose');

const lineAllocationSchema = new mongoose.Schema({
  id: { type: String },
  line: { type: String },
  allocated: { type: Number },
  status: { type: String }
}, { _id: false });

const allocationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  planId: { type: String, required: true },
  model: { type: String, required: true },
  required: { type: Number, required: true },
  available: { type: Number, required: true },
  gap: { type: Number, required: true },
  totalAllocated: { type: Number, default: 0 },
  status: { type: String, default: 'Pending' },
  lines: [lineAllocationSchema]
}, { timestamps: true });

module.exports = mongoose.model('Allocation', allocationSchema);