"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") }
    });
    // index utile pour les recherches par email
    await queryInterface.addIndex("Users", ["email"], { unique: true, name: "users_email_uindex" });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("Users", "users_email_uindex");
    await queryInterface.dropTable("Users");
  }
};