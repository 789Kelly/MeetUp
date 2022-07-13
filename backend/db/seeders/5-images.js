"use strict";

const { Image } = require("../models");

const images = [
  {
    imageableId: 1,
    imageableType: "group",
    url: "test1",
  },
  {
    imageableId: 2,
    imageableType: "group",
    url: "test2",
  },
  {
    imageableId: 3,
    imageableType: "group",
    url: "test3",
  },
  {
    imageableId: 4,
    imageableType: "group",
    url: "test4",
  },
  {
    imageableId: 5,
    imageableType: "group",
    url: "test5",
  },
  {
    imageableId: 6,
    imageableType: "group",
    url: "test6",
  },
  {
    imageableId: 7,
    imageableType: "group",
    url: "test7",
  },
  {
    imageableId: 8,
    imageableType: "group",
    url: "test8",
  },
  {
    imageableId: 9,
    imageableType: "group",
    url: "test9",
  },
  {
    imageableId: 1,
    imageableType: "event",
    url: "test10",
  },
  {
    imageableId: 2,
    imageableType: "event",
    url: "test11",
  },
  {
    imageableId: 3,
    imageableType: "event",
    url: "test12",
  },
  {
    imageableId: 4,
    imageableType: "event",
    url: "test13",
  },
  {
    imageableId: 5,
    imageableType: "event",
    url: "test14",
  },
  {
    imageableId: 6,
    imageableType: "event",
    url: "test15",
  },
  {
    imageableId: 7,
    imageableType: "event",
    url: "test16",
  },
  {
    imageableId: 8,
    imageableType: "event",
    url: "test17",
  },
  {
    imageableId: 9,
    imageableType: "event",
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
    await queryInterface.bulkDelete("Images", null, {});
  },
};
