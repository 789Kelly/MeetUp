"use strict";

const { Event } = require("../models");

const events = [
  {
    name: "Event One",
    description: "test",
    type: "test",
    capacity: 100,
    price: 1.00,
    startDate: ,
    endDate: ,
  },
  {
    name: "Event Two",
    description: "test",
    type: "test",
    capacity: 200,
    price: 2.00,
    startDate: ,
    endDate: ,
  },
  {
    name: "Event Three",
    description: "test",
    type: "test",
    capacity: 300,
    price: 3.00,
    startDate: ,
    endDate: ,
  },
  {
    name: "Event Four",
    description: "test",
    type: "test",
    capacity: 400,
    price: 4.00,
    startDate: ,
    endDate: ,
  },
  {
    name: "Event Five",
    description: "test",
    type: "test",
    capacity: 500,
    price: 5.00,
    startDate: ,
    endDate: ,
  },
  {
    name: "Event Six",
    description: "test",
    type: "test",
    capacity: 600,
    price: 6.00,
    startDate: ,
    endDate: ,
  },
  {
    name: "Event Seven",
    description: "test",
    type: "test",
    capacity: 700,
    price: 7.00,
    startDate: ,
    endDate: ,
  },
  {
    name: "Event Eight",
    description: "test",
    type: "test",
    capacity: 800,
    price: 8.00,
    startDate: ,
    endDate: ,
  },
  {
    name: "Event Nine",
    description: "test",
    type: "test",
    capacity: 900,
    price: 9.00,
    startDate: ,
    endDate: ,
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await Event.bulkCreate(events, {
      validate: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await Event.bulkDelete(events, {});
  },
};
