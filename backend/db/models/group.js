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
      name: DataTypes.STRING,
      about: DataTypes.STRING,
      type: DataTypes.STRING,
      private: DataTypes.BOOLEAN,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Group",
    }
  );
  return Group;
};
