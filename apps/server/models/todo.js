"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      Todo.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Todo.init(
    {
      title: { type: DataTypes.STRING, allowNull: false },
      done: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      dueDate: { type: DataTypes.DATE, allowNull: true },
      userId: { type: DataTypes.INTEGER, allowNull: false }
    },
    { sequelize, modelName: "Todo" }
  );
  return Todo;
};
