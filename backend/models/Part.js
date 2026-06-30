const mongoose = require('mongoose');

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

module.exports = mongoose.model('Part', partSchema);