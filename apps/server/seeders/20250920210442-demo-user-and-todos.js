"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up (queryInterface) {
    const passwordHash = await bcrypt.hash("secret123", 10);

    await queryInterface.bulkInsert("Users", [{
      email: "demo@example.com",
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Récupérer l'id de l'utilisateur créé
    const [rows] = await queryInterface.sequelize.query(
      "SELECT id FROM Users WHERE email = 'demo@example.com' LIMIT 1"
    );
    const userId = rows[0].id;

    await queryInterface.bulkInsert("Todos", [
      { title: "Apprendre Sequelize", done: false, userId, createdAt: new Date(), updatedAt: new Date() },
      { title: "Préparer le frontend", done: true, userId, createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete("Todos", null, {});
    await queryInterface.bulkDelete("Users", { email: "demo@example.com" }, {});
  }
};
