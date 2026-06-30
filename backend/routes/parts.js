const express = require('express');
const router = express.Router();
const Part = require('../models/Part');

router.get('/', async (req, res) => {
  try {
    const parts = await Part.find().sort({ _id: -1 });
    res.json(parts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const part = new Part(req.body);
  try {
    const newPart = await part.save();
    res.status(201).json(newPart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Part.findOneAndUpdate({ part_id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Part.findOneAndDelete({ part_id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Part not found' });
    }
    res.json({ message: 'Part deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;