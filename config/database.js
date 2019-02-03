require("dotenv").config()
const { join } = require("path")

module.exports = {
  client: "pg",
  connection: process.env.DATABASE_URL,
  debug: (process.env.DEBUG || "").includes("knex"),
  migrations: {
    directory: join(__dirname, "..", "migrations")
  }
}
