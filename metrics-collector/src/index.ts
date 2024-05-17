import * as dotenv from "dotenv";
import { collectPRMetrics } from "./pr_metrics";
import { collectNpmMetrics } from "./npm_metrics";

// Load environment variables from .env file
dotenv.config();

async function main() {
  try {
    // await collectPRMetrics();
    await collectNpmMetrics();
  } catch (error) {
    console.error(error);
  }
}

main();
