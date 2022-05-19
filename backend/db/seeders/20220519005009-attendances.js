"use strict";

const { Attendance } = require("../models");

const attendances = [
  {
    status: "attending",
    userId: 1,
    eventId: 1,
  },
  {
    status: "pending",
    userId: 2,
    eventId: 2,
  },
  {
    status: "rejected",
    userId: 3,
    eventId: 3,
  },
  {
    status: "attending",
    userId: 1,
    eventId: 4,
  },
  {
    status: "pending",
    userId: 2,
    eventId: 5,
  },
  {
    status: "rejected",
    userId: 3,
    eventId: 6,
  },
  {
    status: "attending",
    userId: 1,
    eventId: 7,
  },
  {
    status: "pending",
    userId: 2,
    eventId: 8,
  },
  {
    status: "rejected",
    userId: 3,
    eventId: 9,
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await Attendance.bulkCreate(attendances, {
      validate: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Attendances", null, {});
  },
};
