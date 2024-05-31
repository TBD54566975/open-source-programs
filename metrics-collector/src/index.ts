import * as dotenv from "dotenv";
dotenv.config();

import { collectGhMetrics } from "./gh-metrics";
import { collectNpmMetrics } from "./npm-metrics";
import { collectSonatypeMetrics } from "./sonatype-metrics";

const isLocalPersistence = process.env.PERSIST_LOCAL_FILES === "true";

async function main() {
  try {
    await collectGhMetrics(isLocalPersistence);
    await collectNpmMetrics(isLocalPersistence);
    await collectSonatypeMetrics(isLocalPersistence);
  } catch (error) {
    console.error(error);
  }
}

main();
