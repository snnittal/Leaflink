import request from "supertest";
import express from "express";
import authRoutes from "../routes/auth";
import { User } from "../models/User";
import mongoose from "mongoose";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth Routes", () => {
  beforeAll(async () => {
    // Connect to test DB if needed
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should register a user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should login a user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
