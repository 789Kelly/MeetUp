"use strict";

const { Membership } = require("../models");

const memberships = [
  {
    status: "member",
  },
  {
    status: "pending",
  },
  {
    status: "rejected",
  },
  {
    status: "member",
  },
  {
    status: "pending",
  },
  {
    status: "rejected",
  },
  {
    status: "member",
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
    await Membership.bulkCreate(memberships, {
      validate: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await Membership.bulkDelete(memberships, {});
  },
};
