"use strict";

const { Venue } = require("../models");

const venues = [
  {
    url: "test1",
  },
  {
    url: "test2",
  },
  {
    url: "test3",
  },
  {
    url: "test4",
  },
  {
    url: "test5",
  },
  {
    url: "test6",
  },
  {
    url: "test7",
  },
  {
    url: "test8",
  },
  {
    url: "test9",
  },
  {
    url: "test10",
  },
  {
    url: "test11",
  },
  {
    url: "test12",
  },
  {
    url: "test13",
  },
  {
    url: "test14",
  },
  {
    url: "test15",
  },
  {
    url: "test16",
  },
  {
    url: "test17",
  },
  {
    url: "test18",
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await Image.bulkCreate(images, {
      validate: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await Image.bulkDelete(images, {});
  },
};
