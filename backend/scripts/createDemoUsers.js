// backend/scripts/createDemoUsers.js
import { sequelize } from "../src/models/index.js";
import models from "../src/models/index.js";

async function createDemoUsers() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Demo doctor users
    const demoUsers = [
      {
        username: "dr.popescu",
        password: "password123",
        firstname: "Ion",
        lastname: "Popescu",
      },
      {
        username: "dr.ionescu",
        password: "password123",
        firstname: "Maria",
        lastname: "Ionescu",
      },
      {
        username: "dr.maria",
        password: "password123",
        firstname: "Ana",
        lastname: "Maria",
      },
    ];

    for (const userData of demoUsers) {
      try {
        // Check if user already exists
        const existingUser = await models.User.findOne({
          where: { username: userData.username },
        });

        if (existingUser) {
          console.log(
            `⚠️  User ${userData.username} already exists, skipping...`
          );
          continue;
        }

        // Create user record with dentist information
        const user = await models.User.create({
          username: userData.username,
          password: userData.password, // In production, hash this password
          type: "dentist",
          data_inscriere: new Date().toISOString().split("T")[0],
          firstname: userData.firstname,
          lastname: userData.lastname,
        });

        console.log(
          `✅ Created demo user: ${userData.username} (${userData.firstname} ${userData.lastname})`
        );
      } catch (error) {
        console.error(
          `❌ Error creating user ${userData.username}:`,
          error.message
        );
      }
    }

    console.log("✅ Demo users creation completed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createDemoUsers();
