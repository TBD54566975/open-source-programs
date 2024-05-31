import * as dotenv from "dotenv";
import { collectPRMetrics } from "./pr-metrics";
import { collectNpmMetrics } from "./npm-metrics";

// Load environment variables from .env file
dotenv.config();

const isLocalPersistence = process.env.PERSIST_LOCAL_FILES === "true";

async function main() {
  try {
    await collectPRMetrics(isLocalPersistence);
    await collectNpmMetrics(isLocalPersistence);
  } catch (error) {
    console.error(error);
  }
}

main();
