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
      Group.belongsToMany(models.User, {
        as: "Organizer",
        through: models.Membership,
        foreignKey: "groupId",
        otherKey: "userId",
      });
      Group.hasMany(models.Event, {
        foreignKey: "groupId",
        onDelete: "CASCADE",
        hooks: true,
      });
      Group.hasMany(models.Venue, { foreignKey: "groupId" });
      Group.hasMany(models.Image, {
        foreignKey: "groupId",
        onDelete: "CASCADE",
        hooks: true,
      });
      Group.belongsTo(models.User, {
        foreignKey: "organizerId",
      });
      Group.hasMany(models.Membership, {
        foreignKey: "groupId",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  }
  Group.init(
    {
      organizerId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
        validate: {
          len: [1, 60],
        },
      },
      about: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          len: [50, 256],
        },
      },
      type: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          len: [1, 30],
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
          len: [1, 30],
        },
      },
      state: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          len: [1, 30],
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
