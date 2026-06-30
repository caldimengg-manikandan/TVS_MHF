const mongoose = require('mongoose');

const vehicleModelSchema = new mongoose.Schema({
  vehicle_id: { type: String, required: true, unique: true },
  vehicle_name: { type: String, required: true },
  variant: { type: String, required: true },
  status: { type: String, default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('VehicleModel', vehicleModelSchema);