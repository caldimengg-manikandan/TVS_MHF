const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir);

const routes = {
  'vehicles.js': `const express = require('express');
const router = express.Router();
const VehicleModel = require('../models/VehicleModel');

router.get('/', async (req, res) => {
  try {
    const vehicles = await VehicleModel.find();
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

module.exports = router;`,

  'parts.js': `const express = require('express');
const router = express.Router();
const Part = require('../models/Part');

router.get('/', async (req, res) => {
  try {
    const parts = await Part.find();
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

module.exports = router;`,

  'plans.js': `const express = require('express');
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

module.exports = router;`,

  'allocations.js': `const express = require('express');
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

module.exports = router;`,

  'gaps.js': `const express = require('express');
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

module.exports = router;`,

  'transfers.js': `const express = require('express');
const router = express.Router();
const Transfer = require('../models/Transfer');

router.get('/', async (req, res) => {
  try {
    const transfers = await Transfer.find();
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

module.exports = router;`,

  'requests.js': `const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

router.get('/', async (req, res) => {
  try {
    const requests = await Request.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const r = new Request(req.body);
  try {
    const newR = await r.save();
    res.status(201).json(newR);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Request.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;`
};

for (const [filename, content] of Object.entries(routes)) {
  fs.writeFileSync(path.join(routesDir, filename), content);
}
console.log('Routes created successfully.');
