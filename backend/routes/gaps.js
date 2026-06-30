const express = require('express');
const router = express.Router();
const Gap = require('../models/Gap');

router.get('/', async (req, res) => {
  try {
    const gaps = await Gap.find();
    res.json(gaps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const gap = new Gap(req.body);
  try {
    const newGap = await gap.save();
    res.status(201).json(newGap);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Gap.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;