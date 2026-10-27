import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// Shared in-memory MongoDB instance for the whole test run. Nothing here
// touches a real database. We pin the MongoDB binary version because newer
// releases may require AVX instructions that are not available in some CI/VM
// environments, which causes the process to exit with SIGILL.
let mongod;

function clearMongoLockfile(version) {
  const cacheDir = path.join(os.homedir(), ".cache", "mongodb-binaries");
  const lockFile = path.join(cacheDir, `${version}.lock`);

  try {
    fs.rmSync(lockFile, { force: true });
  } catch (_err) {
    // Ignore lock-file cleanup failures; the next startup should still proceed.
  }
}

export async function startTestDb() {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-do-not-use-in-production";
  process.env.NODE_ENV = "test";

  const mongoVersion = process.env.MONGOMS_VERSION || "6.0.14";
  clearMongoLockfile(mongoVersion);

  mongod = await MongoMemoryServer.create({
    binary: { version: mongoVersion },
  });

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
