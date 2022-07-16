"use strict";
const { Model } = require("sequelize");
const group = require("./group");
const uppercaseFirst = (str) => `${str[0].toUpperCase()}${str.substr(1)}`;
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    getImageable(options) {
      if (!this.imageableId) return Promise.resolve(null);
      const mixinMethodName = `get${uppercaseFirst(this.imageableType)}`;
      return this[mixinMethodName](options);
    }
    static associate(models) {
      Image.belongsTo(models.Group, {
        foreignKey: "imageableId",
        constraints: false,
      });
      Image.belongsTo(models.Event, {
        foreignKey: "imageableId",
        constraints: false,
      });
    }
  }
  Image.init(
    {
      imageableId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      imageableType: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      url: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          len: [0, 30],
        },
      },
    },
    {
      sequelize,
      modelName: "Image",
    }
  );
  Image.addHook("afterFind", (findResult) => {
    if (!Array.isArray(findResult)) findResult = [findResult];
    for (const instance of findResult) {
      if (instance.imageableType === "group" && instance.group !== undefined) {
        instance.imageable = instance.group;
      } else if (
        instance.imageableType === "event" &&
        instance.event !== undefined
      ) {
        instance.imageable = instance.event;
      }
      // To prevent mistakes:
      delete instance.group;
      delete instance.dataValues.group;
      delete instance.event;
      delete instance.dataValues.event;
    }
  });
  return Image;
};
