import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { startTestDb, stopTestDb, clearTestDb } from "./setup.js";

let app;

beforeAll(async () => {
  await startTestDb();
  app = (await import("../server.js")).default;
});
afterAll(stopTestDb);
beforeEach(clearTestDb);

describe("POST /api/auth/register (bootstrap)", () => {
  it("creates the first admin with no token required", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "First Admin",
      email: "first@astu.edu.et",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe("first@astu.edu.et");
    expect(res.body.password).toBeUndefined(); // hash must never be returned
  });

  it("rejects a second, unauthenticated registration once an admin exists", async () => {
    await request(app).post("/api/auth/register").send({
      name: "First Admin",
      email: "first@astu.edu.et",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Second Admin",
      email: "second@astu.edu.et",
      password: "password123",
    });
    expect(res.status).toBe(403);
  });

  it("allows an existing logged-in admin to create another admin", async () => {
    await request(app).post("/api/auth/register").send({
      name: "First Admin",
      email: "first@astu.edu.et",
      password: "password123",
    });
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "first@astu.edu.et", password: "password123" });
    const token = loginRes.body.token;

    const res = await request(app)
      .post("/api/auth/register")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Second Admin", email: "second@astu.edu.et", password: "password123" });
    expect(res.status).toBe(201);
  });

  it("rejects a password shorter than 8 characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "X", email: "x@astu.edu.et", password: "short" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Admin",
      email: "admin@astu.edu.et",
      password: "password123",
    });
  });

  it("logs in with correct credentials and returns a token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@astu.edu.et", password: "password123" });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user.password).toBeUndefined();
  });

  it("rejects a wrong password with a generic message", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@astu.edu.et", password: "wrong-password" });
    expect(res.status).toBe(401);
  });

  it("rejects an unknown email with the same generic message as a wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@astu.edu.et", password: "password123" });
    expect(res.status).toBe(401);
  });
});

describe("Admin login is never determined by frontend/email content", () => {
  it("an email containing the word 'admin' with no valid credentials still fails", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "totally-admin@astu.edu.et", password: "whatever" });
    expect(res.status).toBe(401);
  });
});
