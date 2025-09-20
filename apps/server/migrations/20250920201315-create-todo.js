"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Todos", {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      title: { type: Sequelize.STRING, allowNull: false },
      done: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      dueDate: { type: Sequelize.DATE, allowNull: true },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") }
    });

    await queryInterface.addIndex("Todos", ["userId"], { name: "todos_userId_index" });
    await queryInterface.addIndex("Todos", ["done"], { name: "todos_done_index" });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("Todos", "todos_done_index");
    await queryInterface.removeIndex("Todos", "todos_userId_index");
    await queryInterface.dropTable("Todos");
  }
};
