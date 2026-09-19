import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { startTestDb, stopTestDb, clearTestDb } from "./setup.js";

let app;

async function createAdminAndLogin() {
  await request(app)
    .post("/api/auth/register")
    .send({ name: "Admin", email: "admin@astu.edu.et", password: "password123" });
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@astu.edu.et", password: "password123" });
  return res.body.token;
}

beforeAll(async () => {
  await startTestDb();
  app = (await import("../server.js")).default;
});
afterAll(stopTestDb);
beforeEach(clearTestDb);

describe("Public lost-item report — no login required", () => {
  it("creates a lost report with no Authorization header at all", async () => {
    const res = await request(app).post("/api/items/lost").send({
      title: "Black backpack",
      category: "Bags",
      location: "Main Library",
      eventDate: "2026-09-01",
      reporterStudentId: "UGR/1234/17",
    });
    expect(res.status).toBe(201);
    expect(res.body.type).toBe("lost");
    // Public response must never include the reporter's student ID.
    expect(res.body.reporterStudentId).toBeUndefined();
  });

  it("rejects a lost report with a missing student ID", async () => {
    const res = await request(app).post("/api/items/lost").send({
      title: "Black backpack",
      category: "Bags",
      location: "Main Library",
      eventDate: "2026-09-01",
    });
    expect(res.status).toBe(400);
  });
});

describe("Unauthenticated writes to the item API are rejected (the prototype's core flaw)", () => {
  it("blocks registering a found item with no token", async () => {
    const res = await request(app).post("/api/items/found").send({
      title: "Phone",
      category: "Electronics",
      location: "Cafeteria",
      eventDate: "2026-09-01",
    });
    expect(res.status).toBe(401);
  });

  it("blocks updating an item with no token", async () => {
    const admin = await createAdminAndLogin();
    const created = await request(app)
      .post("/api/items/found")
      .set("Authorization", `Bearer ${admin}`)
      .send({ title: "Phone", category: "Electronics", location: "Cafeteria", eventDate: "2026-09-01" });

    const res = await request(app).patch(`/api/items/${created.body._id}`).send({ title: "Hacked" });
    expect(res.status).toBe(401);
  });

  it("blocks deleting an item with no token", async () => {
    const admin = await createAdminAndLogin();
    const created = await request(app)
      .post("/api/items/found")
      .set("Authorization", `Bearer ${admin}`)
      .send({ title: "Phone", category: "Electronics", location: "Cafeteria", eventDate: "2026-09-01" });

    const res = await request(app).delete(`/api/items/${created.body._id}`);
    expect(res.status).toBe(401);
  });
});

describe("Admin found-item intake", () => {
  it("registers a found item and stamps who registered it", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app)
      .post("/api/items/found")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Silver laptop",
        category: "Electronics",
        location: "Library",
        eventDate: "2026-09-10",
        finder: { type: "unknown" },
        intake: { receivedThrough: "Library" },
      });
    expect(res.status).toBe(201);
    expect(res.body.intake.registeredBy).toBeTruthy();
  });

  it("allows registering a found item with an unknown/declined finder", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app)
      .post("/api/items/found")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Umbrella",
        category: "Other",
        location: "Student Union",
        eventDate: "2026-09-10",
      });
    expect(res.status).toBe(201);
    expect(res.body.finder.type).toBe("unknown");
  });
});

describe("Mass-assignment protection on item updates", () => {
  it("ignores fields outside the allow-list, e.g. an attempt to force status", async () => {
    const token = await createAdminAndLogin();
    const created = await request(app)
      .post("/api/items/found")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Wallet", category: "Documents", location: "Gate", eventDate: "2026-09-10" });

    const res = await request(app)
      .patch(`/api/items/${created.body._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Brown wallet", status: "resolved", reporterStudentId: "SHOULD_NOT_APPLY" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Brown wallet");
    // status is not on the allow-list for a plain update — must remain "active".
    expect(res.body.status).toBe("active");
  });
});

describe("Public item listing never exposes private fields", () => {
  it("hides finder identity, intake notes and privateDetails from GET /api/items", async () => {
    const token = await createAdminAndLogin();
    await request(app)
      .post("/api/items/found")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Phone",
        category: "Electronics",
        location: "Cafeteria",
        eventDate: "2026-09-10",
        privateDetails: "small scratch under left corner",
        finder: { type: "student", studentId: "UGR/9999/17" },
      });

    const res = await request(app).get("/api/items?type=found");
    expect(res.status).toBe(200);
    const item = res.body.items[0];
    expect(item.privateDetails).toBeUndefined();
    expect(item.finder).toBeUndefined();
    expect(item.intake).toBeUndefined();
  });
});
