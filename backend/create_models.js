const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir);

const models = {
  'VehicleModel.js': `const mongoose = require('mongoose');

const vehicleModelSchema = new mongoose.Schema({
  vehicle_id: { type: String, required: true, unique: true },
  vehicle_name: { type: String, required: true },
  variant: { type: String, required: true },
  status: { type: String, default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('VehicleModel', vehicleModelSchema);`,

  'Part.js': `const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  part_id: { type: String, required: true, unique: true },
  vehicle_id: { type: String, required: true },
  part_name: { type: String, required: true },
  part_number: { type: String, required: true },
  assembly_line: { type: String, required: true },
  plant: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: { type: String, default: 'Active' },
  mhf_params: {
    daily_volume: { type: Number, default: 0 },
    working_hours: { type: Number, default: 8 },
    supplier_hours: { type: Number, default: 0 },
    transit_hours: { type: Number, default: 0 },
    opening_hours: { type: Number, default: 0 },
    poc_hours: { type: Number, default: 0 },
    plant_available: { type: Number, default: null },
    remarks: { type: String, default: '' },
    status: { type: String, default: 'Active' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Part', partSchema);`,

  'DailyPlan.js': `const mongoose = require('mongoose');

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

module.exports = mongoose.model('DailyPlan', dailyPlanSchema);`,

  'Allocation.js': `const mongoose = require('mongoose');

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

module.exports = mongoose.model('Allocation', allocationSchema);`,

  'Gap.js': `const mongoose = require('mongoose');

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

module.exports = mongoose.model('Gap', gapSchema);`,

  'Transfer.js': `const mongoose = require('mongoose');

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

module.exports = mongoose.model('Transfer', transferSchema);`,

  'Request.js': `const mongoose = require('mongoose');

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

module.exports = mongoose.model('Request', requestSchema);`
};

for (const [filename, content] of Object.entries(models)) {
  fs.writeFileSync(path.join(modelsDir, filename), content);
}
console.log('Models created successfully.');
