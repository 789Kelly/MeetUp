"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Group.belongsToMany(models.User, { through: models.Membership });
      Group.hasMany(models.Event, { foreignKey: "groupId" });
      Group.hasMany(models.Venue, { foreignKey: "groupId" });
      Group.hasMany(models.Image, { foreignKey: "groupId" });
    }
  }
  Group.init(
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
        validate: {
          len: [0, 30],
        },
      },
      about: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          len: [0, 256],
        },
      },
      type: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          len: [0, 30],
        },
      },
      private: {
        allowNull: false,
        defaultValue: true,
        type: DataTypes.BOOLEAN,
      },
      city: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          len: [0, 30],
          isAlpha: true,
        },
      },
      state: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          len: [0, 30],
          isAlpha: true,
        },
      },
    },
    {
      sequelize,
      modelName: "Group",
    }
  );
  return Group;
};
