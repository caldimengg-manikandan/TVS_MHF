const mongoose = require('mongoose');

const rowSchema = new mongoose.Schema({
  id: { type: String },
  model: { type: String },
  volume: { type: Number },
  hours: { type: Number },
  required: { type: Number },
  available: { type: Number },
  gap: { type: Number },
  remarks: { type: String }
}, { _id: false });

const dailyPlanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  status: { type: String, default: 'Draft' },
  version: { type: Number, default: 1 },
  createdBy: { type: String },
  createdOn: { type: String },
  approvedBy: { type: String },
  approvedOn: { type: String },
  rows: [rowSchema]
}, { timestamps: true });

module.exports = mongoose.model('DailyPlan', dailyPlanSchema);