const express = require('express');
const router = express.Router();
const Allocation = require('../models/Allocation');

router.get('/', async (req, res) => {
  try {
    const allocations = await Allocation.find();
    res.json(allocations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const allocation = new Allocation(req.body);
  try {
    const newAlloc = await allocation.save();
    res.status(201).json(newAlloc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Allocation.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;