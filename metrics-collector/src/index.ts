import * as dotenv from "dotenv";
import { collectPRMetrics } from "./pr_metrics";

// Load environment variables from .env file
dotenv.config();

async function main() {
  try {
    await collectPRMetrics();
  } catch (error) {
    console.error(error);
  }
}

main();
