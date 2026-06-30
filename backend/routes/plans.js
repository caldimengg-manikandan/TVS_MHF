const express = require('express');
const router = express.Router();
const DailyPlan = require('../models/DailyPlan');

router.get('/', async (req, res) => {
  try {
    const plans = await DailyPlan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const plan = new DailyPlan(req.body);
  try {
    const newPlan = await plan.save();
    res.status(201).json(newPlan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await DailyPlan.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;