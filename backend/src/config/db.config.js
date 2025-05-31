// src/config/db.config.js
export default {
    DB: "postgres",
    USER: "postgres",
    PASSWORD: "elena",
    HOST: "localhost",
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};