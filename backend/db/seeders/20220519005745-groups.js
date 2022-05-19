"use strict";

const { Group } = require("../models");

const groups = [
  {
    name: "Group One",
    about: "test",
    type: "test",
    private: true,
    city: "Azua",
    state: "Dominican Republic",
  },
  {
    name: "Group Two",
    about: "test",
    type: "test",
    private: false,
    city: "Chiguiri Arriba",
    state: "Panama",
  },
  {
    name: "Group Three",
    about: "test",
    type: "test",
    private: true,
    city: "La Union",
    state: "El Salvador",
  },
  {
    name: "Group Four",
    about: "test",
    type: "test",
    private: false,
    city: "Moscow",
    state: "Russia",
  },
  {
    name: "Group Five",
    about: "test",
    type: "test",
    private: true,
    city: "Brussels",
    state: "Belgium",
  },
  {
    name: "Group Six",
    about: "test",
    type: "test",
    private: false,
    city: "Xian",
    state: "China",
  },
  {
    name: "Group Seven",
    about: "test",
    type: "test",
    private: true,
    city: "Florence",
    state: "Italy",
  },
  {
    name: "Group Eight",
    about: "test",
    type: "test",
    private: false,
    city: "Ankara",
    state: "Turkey",
  },
  {
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
    await Group.bulkDelete(groups, {});
  },
};
