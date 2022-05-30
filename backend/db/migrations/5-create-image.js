"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Images", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      groupId: {
        references: {
          model: "Groups",
          key: "id",
        },
        onDelete: "CASCADE",
        type: Sequelize.INTEGER,
      },
      eventId: {
        references: {
          model: "Events",
          key: "id",
        },
        onDelete: "CASCADE",
        type: Sequelize.INTEGER,
      },
      url: {
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
    await queryInterface.dropTable("Images");
  },
};
