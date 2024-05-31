import * as dotenv from "dotenv";
import { collectPRMetrics } from "./pr-metrics";
import { collectNpmMetrics } from "./npm-metrics";
import { collectSonatypeMetrics } from "./sonatype-metrics";

// Load environment variables from .env file
dotenv.config();

const isLocalPersistence = process.env.PERSIST_LOCAL_FILES === "true";

async function main() {
  try {
    await collectPRMetrics(isLocalPersistence);
    await collectNpmMetrics(isLocalPersistence);
    await collectSonatypeMetrics(isLocalPersistence);
  } catch (error) {
    console.error(error);
  }
}

main();
