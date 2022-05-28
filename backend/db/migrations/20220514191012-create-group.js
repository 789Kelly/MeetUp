"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Groups", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      organizerId: {
        allowNull: false,
        references: {
          model: "Users",
        },
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(60),
        unique: true,
      },
      about: {
        allowNull: false,
        type: Sequelize.STRING(256),
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING(30),
      },
      private: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN,
      },
      city: {
        allowNull: false,
        type: Sequelize.STRING(30),
      },
      state: {
        allowNull: false,
        type: Sequelize.STRING(30),
      },
      createdAt: {
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Groups");
  },
};
