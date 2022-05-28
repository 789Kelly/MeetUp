"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Venue.hasMany(models.Event, { foreignKey: "venueId" });
      Venue.belongsTo(models.Group, { foreignKey: "groupId" });
    }
  }
  Venue.init(
    {
      address: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          len: [1, 30],
        },
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
      lat: DataTypes.FLOAT,
      lng: DataTypes.FLOAT,
      groupId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Venue",
    }
  );
  return Venue;
};
