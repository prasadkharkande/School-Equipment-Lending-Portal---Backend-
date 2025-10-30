// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// health
app.get('/health', (req, res) => res.json({ ok: true }));

//const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// mount equipment routes
const equipmentRoutes = require('./routes/equipmentRoutes');
app.use('/api/equipment', equipmentRoutes);

const borrowRoutes = require('./routes/borrowRoutes');
app.use('/api/borrow', borrowRoutes);




const PORT = process.env.PORT || 3000;
(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connection ok');
    // If you prefer to sync models without migrations (dev only): await sequelize.sync({ alter: true });
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error('Unable to connect to DB:', err);
    process.exit(1);
  }
})();
