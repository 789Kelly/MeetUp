"use strict";

const { Attendance } = require("../models");

const attendances = [
  {
    status: "attending",
  },
  {
    status: "pending",
  },
  {
    status: "rejected",
  },
  {
    status: "attending",
  },
  {
    status: "pending",
  },
  {
    status: "rejected",
  },
  {
    status: "attending",
  },
  {
    status: "pending",
  },
  {
    status: "rejected",
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await Attendance.bulkCreate(attendances, {
      validate: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await Attendance.bulkDelete(attendances, {});
  },
};
