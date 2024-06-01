import * as dotenv from "dotenv";
dotenv.config();

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { collectGhMetrics } from "./gh-metrics";
import { collectNpmMetrics } from "./npm-metrics";
import { collectSonatypeMetrics } from "./sonatype-metrics";

const isLocalPersistence = process.env.PERSIST_LOCAL_FILES === "true";

interface Arguments {
  "collect-gh": boolean;
  "collect-npm": boolean;
  "collect-sonatype": boolean;
}

const argv = yargs(hideBin(process.argv)).options({
  "collect-gh": {
    type: "boolean",
    description: "Collect GitHub metrics",
    default: false,
  },
  "collect-npm": {
    type: "boolean",
    description: "Collect npm metrics",
    default: false,
  },
  "collect-sonatype": {
    type: "boolean",
    description: "Collect Sonatype metrics",
    default: false,
  },
}).argv as Arguments;

async function main() {
  const collectGh = argv["collect-gh"];
  const collectNpm = argv["collect-npm"];
  const collectSonatype = argv["collect-sonatype"];

  const noArgs = !collectGh && !collectNpm && !collectSonatype;

  if (collectGh || noArgs) {
    await collectGhMetrics(isLocalPersistence);
  }
  if (collectNpm || noArgs) {
    await collectNpmMetrics(isLocalPersistence);
  }
  if (collectSonatype || noArgs) {
    await collectSonatypeMetrics(isLocalPersistence);
  }
}

main();
