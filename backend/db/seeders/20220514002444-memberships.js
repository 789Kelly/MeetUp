"use strict";

const { Membership } = require("../models");

const memberships = [
  {
    status: "member",
    userId: 1,
    groupId: 1,
  },
  {
    status: "pending",
    userId: 2,
    groupId: 2,
  },
  {
    status: "rejected",
    userId: 3,
    groupId: 3,
  },
  {
    status: "member",
    userId: 1,
    groupId: 4,
  },
  {
    status: "pending",
    userId: 2,
    groupId: 5,
  },
  {
    status: "rejected",
    userId: 3,
    groupId: 6,
  },
  {
    status: "member",
    userId: 1,
    groupId: 7,
  },
  {
    status: "pending",
    userId: 2,
    groupId: 8,
  },
  {
    status: "rejected",
    userId: 3,
    groupId: 9,
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await Membership.bulkCreate(memberships, {
      validate: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Memberships", null, {});
  },
};
