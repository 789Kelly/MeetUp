"use strict";

const { Attendance } = require("../models");

const attendances = [
  {
    status: "member",
    userId: 1,
    eventId: 1,
  },
  {
    status: "member",
    userId: 2,
    eventId: 1,
  },
  {
    status: "member",
    userId: 3,
    eventId: 1,
  },
  {
    status: "pending",
    userId: 4,
    eventId: 1,
  },
  {
    status: "waitlist",
    userId: 5,
    eventId: 1,
  },
  {
    status: "member",
    userId: 2,
    eventId: 2,
  },
  {
    status: "member",
    userId: 3,
    eventId: 2,
  },
  {
    status: "member",
    userId: 4,
    eventId: 2,
  },
  {
    status: "pending",
    userId: 5,
    eventId: 2,
  },
  {
    status: "waitlist",
    userId: 1,
    eventId: 2,
  },
  {
    status: "member",
    userId: 3,
    eventId: 3,
  },
  {
    status: "member",
    userId: 4,
    eventId: 3,
  },
  {
    status: "member",
    userId: 5,
    eventId: 3,
  },
  {
    status: "pending",
    userId: 1,
    eventId: 3,
  },
  {
    status: "waitlist",
    userId: 2,
    eventId: 3,
  },
  {
    status: "member",
    userId: 4,
    eventId: 4,
  },
  {
    status: "member",
    userId: 5,
    eventId: 4,
  },
  {
    status: "member",
    userId: 1,
    eventId: 4,
  },
  {
    status: "pending",
    userId: 2,
    eventId: 4,
  },
  {
    status: "waitlist",
    userId: 3,
    eventId: 4,
  },
  {
    status: "member",
    userId: 5,
    eventId: 5,
  },
  {
    status: "member",
    userId: 1,
    eventId: 5,
  },
  {
    status: "member",
    userId: 2,
    eventId: 5,
  },
  {
    status: "pending",
    userId: 3,
    eventId: 5,
  },
  {
    status: "waitlist",
    userId: 4,
    eventId: 5,
  },
  {
    status: "member",
    userId: 1,
    eventId: 6,
  },
  {
    status: "member",
    userId: 2,
    eventId: 6,
  },
  {
    status: "member",
    userId: 3,
    eventId: 6,
  },
  {
    status: "pending",
    userId: 4,
    eventId: 6,
  },
  {
    status: "waitlist",
    userId: 5,
    eventId: 6,
  },
  {
    status: "member",
    userId: 2,
    eventId: 7,
  },
  {
    status: "member",
    userId: 3,
    eventId: 7,
  },
  {
    status: "member",
    userId: 4,
    eventId: 7,
  },
  {
    status: "pending",
    userId: 5,
    eventId: 7,
  },
  {
    status: "waitlist",
    userId: 1,
    eventId: 7,
  },
  {
    status: "member",
    userId: 3,
    eventId: 8,
  },
  {
    status: "member",
    userId: 4,
    eventId: 8,
  },
  {
    status: "member",
    userId: 5,
    eventId: 8,
  },
  {
    status: "pending",
    userId: 1,
    eventId: 8,
  },
  {
    status: "waitlist",
    userId: 2,
    eventId: 8,
  },
  {
    status: "member",
    userId: 4,
    eventId: 9,
  },
  {
    status: "member",
    userId: 5,
    eventId: 9,
  },
  {
    status: "co-host",
    userId: 1,
    eventId: 9,
  },
  {
    status: "pending",
    userId: 2,
    eventId: 9,
  },
  {
    status: "waitlist",
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
