import mongoose from "mongoose";
import pg from "pg";

const { Pool } = pg;

const postgresConfig = {
  host: process.env.PG_HOST || "localhost",
  port: Number(process.env.PG_PORT || 5432),
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "",
  database: process.env.PG_DATABASE || "ciphersqlstudio"
};

export const pgPool = new Pool(postgresConfig);

export async function connectMongo() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) return;

  await mongoose.connect(mongoUri);
}
