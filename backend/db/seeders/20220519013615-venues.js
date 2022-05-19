"use strict";

const { Venue } = require("../models");

const venues = [
  {
    address: "test",
    city: "test",
    state: "test",
    lat: 100.0,
    lng: 100.0,
  },
  {
    address: "test",
    city: "test",
    state: "test",
    lat: 99.0,
    lng: 99.0,
  },
  {
    address: "test",
    city: "test",
    state: "test",
    lat: 98.0,
    lng: 98.0,
  },
  {
    address: "test",
    city: "test",
    state: "test",
    lat: 97.0,
    lng: 97.0,
  },
  {
    address: "test",
    city: "test",
    state: "test",
    lat: 96.0,
    lng: 96.0,
  },
  {
    address: "test",
    city: "test",
    state: "test",
    lat: 95.0,
    lng: 95.0,
  },
  {
    address: "test",
    city: "test",
    state: "test",
    lat: 94.0,
    lng: 94.0,
  },
  {
    address: "test",
    city: "test",
    state: "test",
    lat: 93.0,
    lng: 93.0,
  },
  {
    address: "test",
    city: "test",
    state: "test",
    lat: 92.0,
    lng: 92.0,
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await Venue.bulkCreate(venues, {
      validate: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await Venue.bulkDelete(venues, {});
  },
};
