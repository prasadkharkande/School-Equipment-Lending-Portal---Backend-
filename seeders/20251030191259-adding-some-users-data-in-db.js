"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const password = await bcrypt.hash("password123", 10);

    const users = [
      // Admins
      { name: "Admin Master", email: "admin@example.com", role: "admin" },
      { name: "Principal Dumbledore", email: "dumbledore@school.com", role: "admin" },

      // Staff
      { name: "Sara Staff", email: "sara@school.com", role: "staff" },
      { name: "Raj LabAssistant", email: "raj.lab@school.com", role: "staff" },
      { name: "Meena Coach", email: "meena.coach@school.com", role: "staff" },

      // Students
      { name: "John Student", email: "john@student.com", role: "student" },
      { name: "Priya Patel", email: "priya@student.com", role: "student" },
      { name: "Arjun Verma", email: "arjun@student.com", role: "student" },
      { name: "Leela Nair", email: "leela@student.com", role: "student" },
      { name: "Ravi Kumar", email: "ravi@student.com", role: "student" },
      { name: "Sneha Iyer", email: "sneha@student.com", role: "student" },
      { name: "Vikram Shah", email: "vikram@student.com", role: "student" },
      { name: "Anita Reddy", email: "anita@student.com", role: "student" },
      { name: "Kabir Khan", email: "kabir@student.com", role: "student" },
    ];

    await queryInterface.bulkInsert(
      "Users",
      users.map((u) => ({
        ...u,
        password,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
