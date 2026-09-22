import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { startTestDb, stopTestDb, clearTestDb } from "./setup.js";

let app;

async function createAdminAndLogin(email = "admin@astu.edu.et") {
  await request(app).post("/api/auth/register").send({ name: "Admin", email, password: "password123" });
  const res = await request(app).post("/api/auth/login").send({ email, password: "password123" });
  return res.body.token;
}

function foundReportPayload(overrides = {}) {
  return {
    title: "Silver phone",
    category: "Electronics",
    location: "Cafeteria",
    eventDate: "2026-09-10",
    finderStudentId: "UGR/5555/17",
    ...overrides,
  };
}

beforeAll(async () => {
  await startTestDb();
  app = (await import("../server.js")).default;
});
afterAll(stopTestDb);
beforeEach(clearTestDb);

// Scenario 1 — Student submits found report
describe("Scenario 1 — student submits a found-item report", () => {
  it("succeeds with no Authorization header and creates a pending report", async () => {
    const res = await request(app).post("/api/items/found-report").send(foundReportPayload());
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending_handover");
    expect(res.body.type).toBe("found");
  });

  it("requires a valid finder student ID", async () => {
    const res = await request(app)
      .post("/api/items/found-report")
      .send(foundReportPayload({ finderStudentId: "" }));
    expect(res.status).toBe(400);
  });

  it("requires the other core fields, same as any item report", async () => {
    const res = await request(app).post("/api/items/found-report").send({ title: "Phone" });
    expect(res.status).toBe(400);
  });
});

// Scenario 2 — Public listing excludes pending report
describe("Scenario 2 — pending reports never appear in public listings", () => {
  it("is absent from GET /api/items", async () => {
    await request(app).post("/api/items/found-report").send(foundReportPayload());
    const res = await request(app).get("/api/items").query({ type: "found" });
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(0);
  });

  it("is absent even if a caller explicitly asks for status=pending_handover", async () => {
    await request(app).post("/api/items/found-report").send(foundReportPayload());
    const res = await request(app).get("/api/items").query({ status: "pending_handover" });
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(0);
    expect(res.body.total).toBe(0);
  });

  it("GET /api/items/:id returns 404 for a pending report, same as a nonexistent item", async () => {
    const created = await request(app).post("/api/items/found-report").send(foundReportPayload());
    const res = await request(app).get(`/api/items/${created.body.id}`);
    expect(res.status).toBe(404);
  });
});

// Scenario 3 — Admin sees pending report
describe("Scenario 3 — admin can see pending reports", () => {
  it("appears in the admin pending-reports queue with full detail", async () => {
    const token = await createAdminAndLogin();
    await request(app).post("/api/items/found-report").send(foundReportPayload());

    const res = await request(app)
      .get("/api/items/found-reports/pending")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].finder.studentId).toBe("UGR/5555/17");
  });

  it("blocks the pending-reports queue with no admin token", async () => {
    await request(app).post("/api/items/found-report").send(foundReportPayload());
    const res = await request(app).get("/api/items/found-reports/pending");
    expect(res.status).toBe(401);
  });
});

// Scenario 4 — Admin has not received the physical item yet
describe("Scenario 4 — an unaccepted pending report is neither public nor claimable", () => {
  it("cannot be claimed while pending_handover", async () => {
    const created = await request(app).post("/api/items/found-report").send(foundReportPayload());
    const res = await request(app)
      .post(`/api/items/${created.body.id}/claims`)
      .send({ claimantStudentId: "UGR/1111/17", explanation: "Mine." });
    // Behaves exactly like a nonexistent item to a public caller.
    expect(res.status).toBe(404);
  });
});

// Scenario 5 — Student brings the item in; admin accepts
describe("Scenario 5 — admin accepts physical handover", () => {
  it("moves the item from pending_handover to active and it becomes public", async () => {
    const token = await createAdminAndLogin();
    const created = await request(app).post("/api/items/found-report").send(foundReportPayload());

    const acceptRes = await request(app)
      .patch(`/api/items/${created.body.id}/accept-handover`)
      .set("Authorization", `Bearer ${token}`)
      .send({ receivedThrough: "Student Union" });
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.status).toBe("active");
    expect(acceptRes.body.intake.receivedThrough).toBe("Student Union");
    expect(acceptRes.body.intake.registeredBy).toBeTruthy();

    const publicRes = await request(app).get(`/api/items/${created.body.id}`);
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.status).toBe("active");
  });

  it("preserves the original submission's data rather than requiring re-entry", async () => {
    const token = await createAdminAndLogin();
    const created = await request(app).post("/api/items/found-report").send(foundReportPayload());

    await request(app)
      .patch(`/api/items/${created.body.id}/accept-handover`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    const publicRes = await request(app).get(`/api/items/${created.body.id}`);
    expect(publicRes.body.title).toBe("Silver phone");
    expect(publicRes.body.location).toBe("Cafeteria");
  });
});

// Scenario 6 — Published item can be claimed
describe("Scenario 6 — once accepted, the item can be claimed", () => {
  it("accepts a claim after handover is accepted", async () => {
    const token = await createAdminAndLogin();
    const created = await request(app).post("/api/items/found-report").send(foundReportPayload());
    await request(app)
      .patch(`/api/items/${created.body.id}/accept-handover`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    const claimRes = await request(app)
      .post(`/api/items/${created.body.id}/claims`)
      .send({ claimantStudentId: "UGR/1111/17", explanation: "It's mine." });
    expect(claimRes.status).toBe(201);
  });
});

// Scenario 7 — Student never brings the item
describe("Scenario 7 — a report nobody follows up on stays pending", () => {
  it("remains pending_handover and non-public indefinitely with no action taken", async () => {
    const token = await createAdminAndLogin();
    await request(app).post("/api/items/found-report").send(foundReportPayload());

    const publicRes = await request(app).get("/api/items").query({ type: "found" });
    expect(publicRes.body.items.length).toBe(0);

    const pendingRes = await request(app)
      .get("/api/items/found-reports/pending")
      .set("Authorization", `Bearer ${token}`);
    expect(pendingRes.body.items[0].status).toBe("pending_handover");
  });
});

// Scenario 8 — Lost-item reporting still works, untouched
describe("Scenario 8 — lost-item reporting is unaffected by this change", () => {
  it("still creates a lost item via POST /api/items/lost with no login", async () => {
    const res = await request(app).post("/api/items/lost").send({
      title: "Black backpack",
      category: "Bags",
      location: "Main Library",
      eventDate: "2026-09-01",
      reporterStudentId: "UGR/1234/17",
    });
    expect(res.status).toBe(201);
    expect(res.body.type).toBe("lost");
  });
});

// Scenario 9 — Unauthorized user cannot publish
describe("Scenario 9 — only an admin can accept a handover", () => {
  it("blocks accept-handover with no token", async () => {
    const created = await request(app).post("/api/items/found-report").send(foundReportPayload());
    const res = await request(app).patch(`/api/items/${created.body.id}/accept-handover`).send({});
    expect(res.status).toBe(401);
  });

  it("refuses to accept-handover on an item that isn't a pending report", async () => {
    const token = await createAdminAndLogin();
    const found = await request(app)
      .post("/api/items/found")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Laptop", category: "Electronics", location: "Library", eventDate: "2026-09-10" });

    const res = await request(app)
      .patch(`/api/items/${found.body._id}/accept-handover`)
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(409); // already active, not a pending report
  });
});

// Scenario 10 — Admin acceptance creates an audit log entry
describe("Scenario 10 — accepting a handover is audited", () => {
  it("records an actor, item, and timestamp on acceptance", async () => {
    const token = await createAdminAndLogin();
    const created = await request(app).post("/api/items/found-report").send(foundReportPayload());
    await request(app)
      .patch(`/api/items/${created.body.id}/accept-handover`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    const auditRes = await request(app)
      .get("/api/audit")
      .set("Authorization", `Bearer ${token}`)
      .query({ itemId: created.body.id });

    const acceptedEntry = auditRes.body.logs.find((l) => l.action === "FOUND_ITEM_ACCEPTED");
    expect(acceptedEntry).toBeTruthy();
    expect(acceptedEntry.actor).toBeTruthy();
    expect(acceptedEntry.createdAt).toBeTruthy();
  });
});
