const { DataSource } = require("typeorm");
const dotenv = require("dotenv");

dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_DATABASE || "role_policy_api",
  entities: [__dirname + "/**/*.entity{.ts,.js}"],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  logging: process.env.NODE_ENV !== "production",
});

module.exports = { AppDataSource };
