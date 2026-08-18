const { Sequelize } = require("sequelize");
const path = require("path");

// SQLite for zero-config local dev.
// To move to Postgres later (e.g. Supabase/Railway), swap this for:
// new Sequelize(process.env.DATABASE_URL, { dialect: "postgres", ... })
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.SQLITE_PATH || path.join(__dirname, "data.sqlite"),
  logging: false,
});

module.exports = sequelize;