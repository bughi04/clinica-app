import { sequelize } from "../src/models/index.js";

async function addUserColumns() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Check if columns exist first, then add them
    const columns = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'useri' 
            AND column_name IN ('firstname', 'lastname');
        `);

    const existingColumns = columns[0].map((col) => col.column_name);

    if (!existingColumns.includes("firstname")) {
      await sequelize.query(
        `ALTER TABLE useri ADD COLUMN firstname VARCHAR(100);`
      );
      console.log("✅ Added firstname column to useri table.");
    } else {
      console.log("⚠️  firstname column already exists.");
    }

    if (!existingColumns.includes("lastname")) {
      await sequelize.query(
        `ALTER TABLE useri ADD COLUMN lastname VARCHAR(100);`
      );
      console.log("✅ Added lastname column to useri table.");
    } else {
      console.log("⚠️  lastname column already exists.");
    }

    console.log("✅ Column addition process completed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

addUserColumns();
