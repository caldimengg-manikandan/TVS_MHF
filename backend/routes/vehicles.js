const express = require('express');
const router = express.Router();
const VehicleModel = require('../models/VehicleModel');

router.get('/', async (req, res) => {
  try {
    const vehicles = await VehicleModel.find().sort({ _id: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const vehicle = new VehicleModel(req.body);
  try {
    const newVehicle = await vehicle.save();
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;