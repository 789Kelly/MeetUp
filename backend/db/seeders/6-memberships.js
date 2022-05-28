"use strict";

const { Membership } = require("../models");

const memberships = [
  {
    status: "member",
    userId: 1,
    groupId: 1,
  },
  {
    status: "member",
    userId: 2,
    groupId: 1,
  },
  {
    status: "co-host",
    userId: 3,
    groupId: 1,
  },
  {
    status: "pending",
    userId: 4,
    groupId: 1,
  },
  {
    status: "member",
    userId: 2,
    groupId: 2,
  },
  {
    status: "member",
    userId: 3,
    groupId: 2,
  },
  {
    status: "co-host",
    userId: 4,
    groupId: 2,
  },
  {
    status: "pending",
    userId: 5,
    groupId: 2,
  },
  {
    status: "member",
    userId: 3,
    groupId: 3,
  },
  {
    status: "member",
    userId: 4,
    groupId: 3,
  },
  {
    status: "co-host",
    userId: 5,
    groupId: 3,
  },
  {
    status: "pending",
    userId: 1,
    groupId: 3,
  },
  {
    status: "member",
    userId: 4,
    groupId: 4,
  },
  {
    status: "member",
    userId: 5,
    groupId: 4,
  },
  {
    status: "co-host",
    userId: 1,
    groupId: 4,
  },
  {
    status: "pending",
    userId: 2,
    groupId: 4,
  },
  {
    status: "member",
    userId: 5,
    groupId: 5,
  },
  {
    status: "member",
    userId: 1,
    groupId: 5,
  },
  {
    status: "co-host",
    userId: 2,
    groupId: 5,
  },
  {
    status: "pending",
    userId: 3,
    groupId: 5,
  },
  {
    status: "member",
    userId: 1,
    groupId: 6,
  },
  {
    status: "member",
    userId: 2,
    groupId: 6,
  },
  {
    status: "co-host",
    userId: 3,
    groupId: 6,
  },
  {
    status: "pending",
    userId: 4,
    groupId: 6,
  },
  {
    status: "member",
    userId: 2,
    groupId: 7,
  },
  {
    status: "member",
    userId: 3,
    groupId: 7,
  },
  {
    status: "co-host",
    userId: 4,
    groupId: 7,
  },
  {
    status: "pending",
    userId: 5,
    groupId: 7,
  },
  {
    status: "member",
    userId: 3,
    groupId: 8,
  },
  {
    status: "member",
    userId: 4,
    groupId: 8,
  },
  {
    status: "co-host",
    userId: 5,
    groupId: 8,
  },
  {
    status: "pending",
    userId: 1,
    groupId: 8,
  },
  {
    status: "member",
    userId: 4,
    groupId: 9,
  },
  {
    status: "member",
    userId: 5,
    groupId: 9,
  },
  {
    status: "co-host",
    userId: 1,
    groupId: 9,
  },
  {
    status: "pending",
    userId: 2,
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
