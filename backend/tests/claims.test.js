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

async function createFoundItem(token) {
  const res = await request(app)
    .post("/api/items/found")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Laptop", category: "Electronics", location: "Library", eventDate: "2026-09-10" });
  return res.body._id;
}

beforeAll(async () => {
  await startTestDb();
  app = (await import("../server.js")).default;
});
afterAll(stopTestDb);
beforeEach(clearTestDb);

describe("Claim submission — public, no login", () => {
  it("accepts a self claim with no Authorization header", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);

    const res = await request(app).post(`/api/items/${itemId}/claims`).send({
      claimType: "self",
      claimantStudentId: "UGR/1111/17",
      explanation: "It has my name engraved on the back.",
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending");
  });

  it("bumps the item from active to under_review once the first claim lands", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);

    await request(app).post(`/api/items/${itemId}/claims`).send({
      claimantStudentId: "UGR/1111/17",
      explanation: "Mine.",
    });

    const itemRes = await request(app).get(`/api/items/${itemId}`);
    expect(itemRes.body.status).toBe("under_review");
  });

  it("requires an ownerStudentId for on_behalf claims", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);

    const res = await request(app).post(`/api/items/${itemId}/claims`).send({
      claimType: "on_behalf",
      claimantStudentId: "UGR/1111/17",
      explanation: "Helping my friend recover this.",
    });
    expect(res.status).toBe(400);
  });

  it("records claimant and intended owner as distinct identities for on_behalf claims", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);

    const res = await request(app).post(`/api/items/${itemId}/claims`).send({
      claimType: "on_behalf",
      claimantStudentId: "UGR/1111/17",
      ownerStudentId: "UGR/2222/17",
      explanation: "Helping my friend recover this.",
    });
    expect(res.status).toBe(201);

    const listRes = await request(app)
      .get(`/api/items/${itemId}/claims`)
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.body[0].claimantStudentId).toBe("UGR/1111/17");
    expect(listRes.body[0].ownerStudentId).toBe("UGR/2222/17");
  });
});

describe("Duplicate claim prevention (itemId + claimantStudentId)", () => {
  it("rejects a second claim from the same student on the same item", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);

    const first = await request(app)
      .post(`/api/items/${itemId}/claims`)
      .send({ claimantStudentId: "UGR/1111/17", explanation: "Mine." });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post(`/api/items/${itemId}/claims`)
      .send({ claimantStudentId: "UGR/1111/17", explanation: "Still mine." });
    expect(second.status).toBe(409);
  });

  it("allows multiple different students to claim the same item", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);

    const a = await request(app)
      .post(`/api/items/${itemId}/claims`)
      .send({ claimantStudentId: "UGR/1111/17", explanation: "Mine." });
    const b = await request(app)
      .post(`/api/items/${itemId}/claims`)
      .send({ claimantStudentId: "UGR/2222/17", explanation: "Actually mine." });
    const c = await request(app)
      .post(`/api/items/${itemId}/claims`)
      .send({ claimantStudentId: "UGR/3333/17", explanation: "No, mine." });

    expect(a.status).toBe(201);
    expect(b.status).toBe(201);
    expect(c.status).toBe(201);

    const listRes = await request(app)
      .get(`/api/items/${itemId}/claims`)
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.body.length).toBe(3);
  });
});

describe("Claim review — admin only, never automatic", () => {
  it("blocks review with no admin token", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);
    const claimRes = await request(app)
      .post(`/api/items/${itemId}/claims`)
      .send({ claimantStudentId: "UGR/1111/17", explanation: "Mine." });

    const res = await request(app)
      .patch(`/api/claims/${claimRes.body.id}/review`)
      .send({ action: "verify" });
    expect(res.status).toBe(401);
  });

  it("verifying one claim does NOT automatically reject the others", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);

    const a = await request(app)
      .post(`/api/items/${itemId}/claims`)
      .send({ claimantStudentId: "UGR/1111/17", explanation: "Mine." });
    const b = await request(app)
      .post(`/api/items/${itemId}/claims`)
      .send({ claimantStudentId: "UGR/2222/17", explanation: "Actually mine." });

    await request(app)
      .patch(`/api/claims/${a.body.id}/review`)
      .set("Authorization", `Bearer ${token}`)
      .send({ action: "verify" });

    const listRes = await request(app)
      .get(`/api/items/${itemId}/claims`)
      .set("Authorization", `Bearer ${token}`);
    const claimB = listRes.body.find((c) => c._id === b.body.id);
    expect(claimB.status).toBe("pending"); // still pending — admin must reject it explicitly
  });

  it("keeps a rejected claim in history rather than deleting it", async () => {
    const token = await createAdminAndLogin();
    const itemId = await createFoundItem(token);
    const claim = await request(app)
      .post(`/api/items/${itemId}/claims`)
      .send({ claimantStudentId: "UGR/1111/17", explanation: "Mine." });

    await request(app)
      .patch(`/api/claims/${claim.body.id}/review`)
      .set("Authorization", `Bearer ${token}`)
      .send({ action: "reject", note: "Description did not match." });

    const listRes = await request(app)
      .get(`/api/items/${itemId}/claims`)
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.body.length).toBe(1);
    expect(listRes.body[0].status).toBe("rejected");
    expect(listRes.body[0].review.note).toBe("Description did not match.");
  });
});
