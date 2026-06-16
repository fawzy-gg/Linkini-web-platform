const { Pool } = require("pg");
require("dotenv").config();

console.log("DB USER:", process.env.DB_USER);
console.log("DB HOST:", process.env.DB_HOST);
console.log("DB NAME:", process.env.DB_NAME);
console.log("DB PORT:", process.env.DB_PORT);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => {
    console.log("✅ Connected to PostgreSQL successfully");
  })
  .catch((err) => {
    console.error("❌ PostgreSQL connection error:", err.message);
  });

module.exports = pool;