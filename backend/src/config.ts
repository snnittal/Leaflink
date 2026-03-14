import dotenv from "dotenv";

dotenv.config();

export const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/leaflink";
export const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";
export const PORT = process.env.PORT || 4000;
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
