"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Equipment", [
      {
        name: "Football Kit",
        category: "Sports",
        condition_status: "Good",
        quantity: 10,
        available: true,
      },
      {
        name: "Cricket Bat",
        category: "Sports",
        condition_status: "Excellent",
        quantity: 6,
        available: true,
      },
      {
        name: "Basketball",
        category: "Sports",
        condition_status: "Good",
        quantity: 8,
        available: true,
      },
      {
        name: "Microscope",
        category: "Science Lab",
        condition_status: "Excellent",
        quantity: 5,
        available: true,
      },
      {
        name: "Beaker Set",
        category: "Science Lab",
        condition_status: "Fair",
        quantity: 15,
        available: true,
      },
      {
        name: "Guitar",
        category: "Music",
        condition_status: "Good",
        quantity: 3,
        available: true,
      },
      {
        name: "Violin",
        category: "Music",
        condition_status: "Excellent",
        quantity: 4,
        available: true,
      },
      {
        name: "DSLR Camera",
        category: "Photography",
        condition_status: "Good",
        quantity: 2,
        available: true,
      },
      {
        name: "Tripod Stand",
        category: "Photography",
        condition_status: "Excellent",
        quantity: 5,
        available: true,
      },
      {
        name: "Projector",
        category: "Classroom",
        condition_status: "Good",
        quantity: 2,
        available: true,
      },
      {
        name: "Laptop",
        category: "IT Equipment",
        condition_status: "Excellent",
        quantity: 7,
        available: true,
      },
      {
        name: "Arduino Kit",
        category: "Electronics Lab",
        condition_status: "Good",
        quantity: 12,
        available: true,
      },
      {
        name: "Chemistry Test Tubes",
        category: "Science Lab",
        condition_status: "Good",
        quantity: 30,
        available: true,
      },
      {
        name: "Whiteboard Markers",
        category: "Stationery",
        condition_status: "Fair",
        quantity: 25,
        available: true,
      },
      {
        name: "First Aid Box",
        category: "Medical",
        condition_status: "Excellent",
        quantity: 3,
        available: true,
      },
    ].map(item => ({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    })));
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Equipment", null, {});
  },
};
