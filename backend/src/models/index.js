// backend/src/models/index.js
import { Sequelize } from "sequelize";
import dbConfig from "../config/db.config.js";

// Import all models
import User from "./User.js";
import Patient from "./Patient.js";
import DentalRecord from "./DentalRecord.js";
import Tutore from "./Tutore.js";
import Dentist from "./Dentist.js";
import Boala from "./Boala.js";
import AntecedenteMedicale from "./AntecedenteMedicale.js";
import Questionnaire from "./Questionnaire.js"; // New enhanced questionnaire model

// Init Sequelize connection
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    logging: false, // Set true if you want to see SQL logs
});

// Collect all models
const models = {
    User,
    Patient,
    DentalRecord,
    Tutore,
    Dentist,
    Boala,
    AntecedenteMedicale,
    Questionnaire // Add the new questionnaire model
};

// Initialize models (define fields & options)
for (const model of Object.values(models)) {
    model.initialize(sequelize);
}

// Define associations (must be after all models are initialized)
for (const model of Object.values(models)) {
    if (typeof model.associate === "function") {
        model.associate(models);
    }
}

// Export sequelize instance and all models
export { sequelize };
export default models;