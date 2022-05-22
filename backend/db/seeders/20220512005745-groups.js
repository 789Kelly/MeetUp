"use strict";

const { Group } = require("../models");

const groups = [
  {
    organizerId: 1,
    name: "Group One",
    about: "test",
    type: "test",
    private: true,
    city: "Azua",
    state: "Dominican Republic",
  },
  {
    organizerId: 2,
    name: "Group Two",
    about: "test",
    type: "test",
    private: false,
    city: "Chiguiri Arriba",
    state: "Panama",
  },
  {
    organizerId: 3,
    name: "Group Three",
    about: "test",
    type: "test",
    private: true,
    city: "La Union",
    state: "El Salvador",
  },
  {
    organizerId: 4,
    name: "Group Four",
    about: "test",
    type: "test",
    private: false,
    city: "Moscow",
    state: "Russia",
  },
  {
    organizerId: 5,
    name: "Group Five",
    about: "test",
    type: "test",
    private: true,
    city: "Brussels",
    state: "Belgium",
  },
  {
    organizerId: 1,
    name: "Group Six",
    about: "test",
    type: "test",
    private: false,
    city: "Xian",
    state: "China",
  },
  {
    organizerId: 2,
    name: "Group Seven",
    about: "test",
    type: "test",
    private: true,
    city: "Florence",
    state: "Italy",
  },
  {
    organizerId: 3,
    name: "Group Eight",
    about: "test",
    type: "test",
    private: false,
    city: "Ankara",
    state: "Turkey",
  },
  {
    organizerId: 4,
    name: "Group Nine",
    about: "test",
    type: "test",
    private: true,
    city: "Cancun",
    state: "Mexico",
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await Group.bulkCreate(groups, {
      validate: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Groups", null, {});
  },
};
