// Migration: Add dentistid column to patients table
// Run this script with: node backend/scripts/addDentistIdToPatients.js

import { sequelize } from "../src/models/index.js";

async function addDentistIdColumn() {
  try {
    await sequelize.query(`
      ALTER TABLE patients
      ADD COLUMN dentistid INTEGER NULL,
      ADD CONSTRAINT fk_patients_dentistid FOREIGN KEY (dentistid) REFERENCES dentisti(dentistid)
    `);
    console.log(
      "Migration successful: dentistid column added to patients table."
    );
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sequelize.close();
  }
}

addDentistIdColumn();
