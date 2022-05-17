"use strict";
const { Model } = require("sequelize");
const group = require("./group");
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Image.belongsTo(models.Group, { foreignKey: "groupId" });
      Image.belongsTo(models.Event, { foreignKey: "eventId" });
    }
  }
  Image.init(
    {
      groupId: DataTypes.INTEGER,
      eventId: DataTypes.INTEGER,
      url: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Image",
    }
  );
  return Image;
};
