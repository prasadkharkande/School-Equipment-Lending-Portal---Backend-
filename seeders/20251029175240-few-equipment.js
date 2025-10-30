'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Equipment', [
      // Sports Items
      {
        name: "Football",
        category: "Sports",
        condition_status: "Good",
        quantity: 10,
        available: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Cricket Bat",
        category: "Sports",
        condition_status: "Excellent",
        quantity: 5,
        available: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Basketball",
        category: "Sports",
        condition_status: "Good",
        quantity: 8,
        available: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Lab Equipment
      {
        name: "Microscope",
        category: "Lab Equipment",
        condition_status: "Good",
        quantity: 4,
        available: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Chemistry Kit",
        category: "Lab Equipment",
        condition_status: "Fair",
        quantity: 6,
        available: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Physics Experiment Box",
        category: "Lab Equipment",
        condition_status: "Excellent",
        quantity: 3,
        available: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Media & Tech
      {
        name: "DSLR Camera",
        category: "Media Equipment",
        condition_status: "Good",
        quantity: 2,
        available: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Tripod Stand",
        category: "Media Equipment",
        condition_status: "Good",
        quantity: 4,
        available: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Laptop",
        category: "Electronics",
        condition_status: "Good",
        quantity: 5,
        available: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Music & Performance
      {
        name: "Guitar",
        category: "Music Instrument",
        condition_status: "Excellent",
        quantity: 2,
        available: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Keyboard",
        category: "Music Instrument",
        condition_status: "Good",
        quantity: 3,
        available: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Project & Craft Supplies
      {
        name: "Art Kit",
        category: "Project Material",
        condition_status: "Good",
        quantity: 15,
        available: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Projector",
        category: "Electronics",
        condition_status: "Good",
        quantity: 2,
        available: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
