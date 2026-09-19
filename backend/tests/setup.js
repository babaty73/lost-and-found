import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// Shared in-memory MongoDB instance for the whole test run. Nothing here
// touches a real database, and no network access is required beyond the
// one-time mongodb-memory-server binary download that `npm install` performs.
let mongod;

export async function startTestDb() {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-do-not-use-in-production";
  process.env.NODE_ENV = "test";
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  await mongoose.connect(uri);
}

export async function stopTestDb() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

export async function clearTestDb() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}
