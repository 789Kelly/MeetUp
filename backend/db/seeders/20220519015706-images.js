"use strict";

const { Venue } = require("../models");

const venues = [
  {
    groupId: 1,
    eventId: null,
    url: "test1",
  },
  {
    groupId: 2,
    eventId: null,
    url: "test2",
  },
  {
    groupId: 3,
    eventId: null,
    url: "test3",
  },
  {
    groupId: 4,
    eventId: null,
    url: "test4",
  },
  {
    groupId: 5,
    eventId: null,
    url: "test5",
  },
  {
    groupId: 6,
    eventId: null,
    url: "test6",
  },
  {
    groupId: 7,
    eventId: null,
    url: "test7",
  },
  {
    groupId: 8,
    eventId: null,
    url: "test8",
  },
  {
    groupId: 9,
    eventId: null,
    url: "test9",
  },
  {
    groupId: null,
    eventId: 1,
    url: "test10",
  },
  {
    groupId: null,
    eventId: 2,
    url: "test11",
  },
  {
    groupId: null,
    eventId: 3,
    url: "test12",
  },
  {
    groupId: null,
    eventId: 4,
    url: "test13",
  },
  {
    groupId: null,
    eventId: 5,
    url: "test14",
  },
  {
    groupId: null,
    eventId: 6,
    url: "test15",
  },
  {
    groupId: null,
    eventId: 7,
    url: "test16",
  },
  {
    groupId: null,
    eventId: 8,
    url: "test17",
  },
  {
    groupId: null,
    eventId: 9,
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
