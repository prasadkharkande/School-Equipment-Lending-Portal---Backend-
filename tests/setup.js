const { sequelize } = require('../models');

beforeAll(async () => {
  // Sync database before tests
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connection after tests
  await sequelize.close();
});