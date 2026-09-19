import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { startTestDb, stopTestDb, clearTestDb } from "./setup.js";

let app;

async function createAdminAndLogin(email = "admin@astu.edu.et") {
  await request(app).post("/api/auth/register").send({ name: "Admin", email, password: "password123" });
  const res = await request(app).post("/api/auth/login").send({ email, password: "password123" });
  return res.body.token;
}

async function createFoundItem(token) {
  const res = await request(app)
    .post("/api/items/found")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Laptop", category: "Electronics", location: "Library", eventDate: "2026-09-10" });
  return res.body._id;
}

async function createAndVerifyClaim(app_, token, itemId, studentId = "UGR/1111/17") {
  const claim = await request(app_)
    .post(`/api/items/${itemId}/claims`)
    .send({ claimantStudentId: studentId, explanation: "Mine." });
  await request(app_)
    .patch(`/api/claims/${claim.body.id}/review`)
    .set("Authorization", `Bearer ${token}`)
    .send({ action: "verify" });
  return claim.body.id;
}

beforeAll(async () => {
  await startTestDb();
  app = (await import("../server.js")).default;
});
afterAll(stopTestDb);
beforeEach(clearTestDb);

describe("Recording a return — the frontend can never do this alone", () => {
  it("blocks recording a return with no token at all", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);
    const claimId = await createAndVerifyClaim(app, token, itemId);

    const res = await request(app).post(`/api/items/${itemId}/return`).send({ claimId });
    expect(res.status).toBe(401);
  });

  it("refuses to return an item using a claim that hasn't been verified", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);
    const claim = await request(app)
      .post(`/api/items/${itemId}/claims`)
      .send({ claimantStudentId: "UGR/1111/17", explanation: "Mine." }); // still pending

    const res = await request(app)
      .post(`/api/items/${itemId}/return`)
      .set("Authorization", `Bearer ${token}`)
      .send({ claimId: claim.body.id });
    expect(res.status).toBe(409);
  });

  it("resolves the item once an admin records the return against a verified claim", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);
    const claimId = await createAndVerifyClaim(app, token, itemId);

    const res = await request(app)
      .post(`/api/items/${itemId}/return`)
      .set("Authorization", `Bearer ${token}`)
      .send({ claimId });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("resolved");
    expect(res.body.resolution.returnedToClaim).toBeTruthy();
  });

  it("will not resolve an already-resolved item a second time", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);
    const claimId = await createAndVerifyClaim(app, token, itemId);

    await request(app)
      .post(`/api/items/${itemId}/return`)
      .set("Authorization", `Bearer ${token}`)
      .send({ claimId });

    const secondClaimId = await createAndVerifyClaim(app, token, itemId, "UGR/9999/17");
    const res = await request(app)
      .post(`/api/items/${itemId}/return`)
      .set("Authorization", `Bearer ${token}`)
      .send({ claimId: secondClaimId });
    expect(res.status).toBe(409);
  });
});

describe("Deletion is blocked once claim history exists", () => {
  it("allows deleting a found item with zero claims", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);
    const res = await request(app).delete(`/api/items/${itemId}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it("refuses to delete a found item that has any claim history, even a rejected one", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);
    const claim = await request(app)
      .post(`/api/items/${itemId}/claims`)
      .send({ claimantStudentId: "UGR/1111/17", explanation: "Mine." });
    await request(app)
      .patch(`/api/claims/${claim.body.id}/review`)
      .set("Authorization", `Bearer ${token}`)
      .send({ action: "reject" });

    const res = await request(app).delete(`/api/items/${itemId}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(409);
  });
});

describe("Item unclaimed / duplicate helpers", () => {
  it("marks an item with no active claims as unclaimed", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);
    const res = await request(app)
      .patch(`/api/items/${itemId}/unclaimed`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("unclaimed");
  });

  it("refuses to mark unclaimed while a pending claim exists", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);
    await request(app)
      .post(`/api/items/${itemId}/claims`)
      .send({ claimantStudentId: "UGR/1111/17", explanation: "Mine." });

    const res = await request(app)
      .patch(`/api/items/${itemId}/unclaimed`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(409);
  });
});
