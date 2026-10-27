import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// Shared in-memory MongoDB instance for the whole test run. The version is
// intentionally selected explicitly and validated against the host CPU before the
// test suite starts, so we fail with a clear message on unsupported machines
// instead of crashing with SIGILL or missing OpenSSL libraries.
const DEFAULT_MONGO_VERSION = "7.0.14";
let mongod;

function resolveMongoVersion() {
  const configuredVersion = process.env.MONGOMS_VERSION;
  if (configuredVersion) {
    return configuredVersion;
  }

  if (process.platform === "linux" && process.arch === "x64") {
    try {
      const lscpuOutput = execSync("lscpu", { encoding: "utf8" });
      const flags = lscpuOutput.toLowerCase();
      const hasAVX = /\bavx\b|\bavx2\b/i.test(flags);

      if (!hasAVX) {
        throw new Error(
          "MongoMemoryServer requires an x64 Linux CPU with AVX support. " +
            "This host does not expose AVX instructions, so the MongoDB test binary cannot start safely. " +
            "Use a compatible CI runner or set MONGOMS_VERSION to a supported binary for this machine."
        );
      }
    } catch (error) {
      if (error && error.message && error.message.includes("AVX")) {
        throw error;
      }
      // If lscpu is unavailable or the environment is unusual, continue with the
      // default binary and let MongoMemoryServer itself report incompatibility.
    }
  }

  return DEFAULT_MONGO_VERSION;
}

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

  const mongoVersion = resolveMongoVersion();
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
