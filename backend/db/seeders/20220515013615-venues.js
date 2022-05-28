"use strict";

const { Venue } = require("../models");

const venues = [
  {
    address: "test",
    city: "Quito",
    state: "Ecuador",
    lat: 89.0,
    lng: 89.0,
    groupId: 1,
  },
  {
    address: "test",
    city: "Cannes",
    state: "France",
    lat: 89.0,
    lng: 89.0,
    groupId: 2,
  },
  {
    address: "test",
    city: "Barcelona",
    state: "Spain",
    lat: 89.0,
    lng: 89.0,
    groupId: 3,
  },
  {
    address: "test",
    city: "Tallin",
    state: "Estonia",
    lat: 89.0,
    lng: 89.0,
    groupId: 4,
  },
  {
    address: "test",
    city: "Athens",
    state: "Greece",
    lat: 89.0,
    lng: 89.0,
    groupId: 5,
  },
  {
    address: "test",
    city: "London",
    state: "England",
    lat: 89.0,
    lng: 89.0,
    groupId: 6,
  },
  {
    address: "test",
    city: "Kyiv",
    state: "Ukraine",
    lat: 89.0,
    lng: 89.0,
    groupId: 7,
  },
  {
    address: "test",
    city: "Warsaw",
    state: "Poland",
    lat: 89.0,
    lng: 89.0,
    groupId: 8,
  },
  {
    address: "test",
    city: "Vilnius",
    state: "Lithuania",
    lat: 89.0,
    lng: 89.0,
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
