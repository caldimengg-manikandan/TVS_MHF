const mongoose = require('mongoose');
require('dotenv').config();

const VehicleModel = require('./models/VehicleModel');
const Part = require('./models/Part');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log('Connected to DB for seeding');
  
  const count = await VehicleModel.countDocuments();
  if (count > 0) {
    console.log('Database already has data. Skipping seed.');
    process.exit(0);
  }

  const MODELS = [
    { model: 'HLX 100',           volumePerDay: 500, plantAvailablePerLine: 15 },
    { model: 'HLX 125 4-speed',   volumePerDay: 500, plantAvailablePerLine: 12 },
    { model: 'HLX 125 5-speed',   volumePerDay: 500, plantAvailablePerLine: 17 },
    { model: 'HLX 150',           volumePerDay: 300, plantAvailablePerLine: 9 },
    { model: 'Radeon',            volumePerDay: 200, plantAvailablePerLine: 5 },
    { model: 'City+ DOM',         volumePerDay: 200, plantAvailablePerLine: 9 },
    { model: 'Sport',             volumePerDay: 250, plantAvailablePerLine: 8 },
    { model: 'Raider',            volumePerDay: 800, plantAvailablePerLine: 21 },
  ];

  let vId = 1;
  let pId = 1;

  for (const m of MODELS) {
    const vehicleId = `V${vId++}`;
    const modelCode = m.model.replace(/[\s\+-]+/g, '');
    
    await VehicleModel.create({
      vehicle_id: vehicleId,
      vehicle_name: m.model,
      variant: 'Standard',
      status: 'Active',
    });

    for (const [idx, wheelLine] of ['Front Wheel Assy', 'Rear Wheel Assy'].entries()) {
      const partId = `P${pId++}`;
      const suffix = idx === 0 ? '-F' : '-R';
      
      await Part.create({
        part_id: partId,
        vehicle_id: vehicleId,
        part_name: wheelLine,
        part_number: `PN-${modelCode}${suffix}`,
        assembly_line: 'Wheel Assembly Line',
        plant: 'Hosur Plant',
        capacity: 20,
        status: 'Active',
        mhf_params: {
          daily_volume: m.volumePerDay,
          working_hours: 8,
          supplier_hours: 0,
          transit_hours: 0,
          opening_hours: 0,
          poc_hours: 0,
          plant_available: m.plantAvailablePerLine,
          remarks: '',
          status: 'Active'
        }
      });
    }
  }

  const countUsers = await User.countDocuments();
  if (countUsers === 0) {
    const INITIAL_USERS = [
      { id: 'u1', email: 'admin@tvs.com', password: 'admin123', role: 'Admin', name: 'System Admin', status: 'Active' },
      { id: 'u2', email: 'planner@tvs.com', password: 'admin123', role: 'Planner', name: 'John Planner', status: 'Active' },
      { id: 'u3', email: 'engineer@tvs.com', password: 'admin123', role: 'Production Engineer', name: 'Sarah Eng', status: 'Active' },
      { id: 'u4', email: 'manager@tvs.com', password: 'admin123', role: 'Plant Manager', name: 'Mike Boss', status: 'Active' },
      { id: 'u5', email: 'stores@tvs.com', password: 'admin123', role: 'Stores', name: 'Stores Desk', status: 'Active' },
      { id: 'u6', email: 'viewer@tvs.com', password: 'admin123', role: 'Viewer', name: 'Guest Viewer', status: 'Active' },
    ];
    await User.insertMany(INITIAL_USERS);
    console.log('Seed users inserted successfully!');
  }

  console.log('Seed data inserted successfully!');
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
