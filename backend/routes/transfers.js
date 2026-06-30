const express = require('express');
const router = express.Router();
const Transfer = require('../models/Transfer');

router.get('/', async (req, res) => {
  try {
    const transfers = await Transfer.find().sort({ _id: -1 });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const transfer = new Transfer(req.body);
  try {
    const newTransfer = await transfer.save();
    res.status(201).json(newTransfer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Transfer.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Transfer.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;