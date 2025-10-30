"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("BorrowRequests", [
      {
        user_id: 6,
        equipment_id: 1,
        status: "approved",
      },
      {
        user_id: 7,
        equipment_id: 4,
        status: "pending",
      },
      {
        user_id: 8,
        equipment_id: 9,
        status: "returned",
      },
      {
        user_id: 9,
        equipment_id: 10,
        status: "pending",
      },
    ].map(r => ({
      ...r,
      createdAt: new Date(),
      updatedAt: new Date(),
    })));
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("BorrowRequests", null, {});
  },
};
