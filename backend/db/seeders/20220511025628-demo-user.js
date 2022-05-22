"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Users",
      [
        {
          firstName: "Clark",
          lastName: "Adams",
          email: "demo@user.io",
          username: "Demo-lition",
          password: bcrypt.hashSync("password"),
        },
        {
          firstName: "John",
          lastName: "Smith",
          email: "user1@user.io",
          username: "FakeUser1",
          password: bcrypt.hashSync("password2"),
        },
        {
          firstName: "Jane",
          lastName: "Doe",
          email: "user2@user.io",
          username: "FakeUser2",
          password: bcrypt.hashSync("password3"),
        },
        {
          firstName: "Test",
          lastName: "Test",
          email: "user3@user.io",
          username: "FakeUser3",
          password: bcrypt.hashSync("password4"),
        },
        {
          firstName: "Test",
          lastName: "Test",
          email: "user4@user.io",
          username: "FakeUser4",
          password: bcrypt.hashSync("password5"),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      "Users",
      {
        username: {
          [Op.in]: [
            "Demo-lition",
            "FakeUser1",
            "FakeUser2",
            "FakeUser3",
            "FakeUser4",
          ],
        },
      },
      {}
    );
  },
};
