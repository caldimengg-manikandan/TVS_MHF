const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Import Routes (To be created)
const vehicleRoutes = require('./routes/vehicles');
const partRoutes = require('./routes/parts');
const planRoutes = require('./routes/plans');
const allocationRoutes = require('./routes/allocations');
const gapRoutes = require('./routes/gaps');
const transferRoutes = require('./routes/transfers');
const requestRoutes = require('./routes/requests');
const userRoutes = require('./routes/users');

// Use Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/gaps', gapRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB successfully connected to Cluster0'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
