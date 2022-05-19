"use strict";

const { Venue } = require("../models");

const venues = [
  {
    address: "test",
    city: "Quito",
    state: "Ecuador",
    lat: 100.0,
    lng: 100.0,
    groupId: 1,
  },
  {
    address: "test",
    city: "Cannes",
    state: "France",
    lat: 99.0,
    lng: 99.0,
    groupId: 2,
  },
  {
    address: "test",
    city: "Barcelona",
    state: "Spain",
    lat: 98.0,
    lng: 98.0,
    groupId: 3,
  },
  {
    address: "test",
    city: "Tallin",
    state: "Estonia",
    lat: 97.0,
    lng: 97.0,
    groupId: 4,
  },
  {
    address: "test",
    city: "Athens",
    state: "Greece",
    lat: 96.0,
    lng: 96.0,
    groupId: 5,
  },
  {
    address: "test",
    city: "London",
    state: "England",
    lat: 95.0,
    lng: 95.0,
    groupId: 6,
  },
  {
    address: "test",
    city: "Kyiv",
    state: "Ukraine",
    lat: 94.0,
    lng: 94.0,
    groupId: 7,
  },
  {
    address: "test",
    city: "Warsaw",
    state: "Poland",
    lat: 93.0,
    lng: 93.0,
    groupId: 8,
  },
  {
    address: "test",
    city: "Vilnius",
    state: "Lithuania",
    lat: 92.0,
    lng: 92.0,
    groupId: 9,
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await Venue.bulkCreate(venues, {
      validate: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Venues", null, {});
  },
};
