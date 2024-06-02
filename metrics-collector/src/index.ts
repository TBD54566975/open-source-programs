import * as dotenv from "dotenv";
dotenv.config();

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { collectGhMetrics } from "./gh-metrics";
import { collectNpmMetrics, saveNpmMetrics } from "./npm-metrics";
import { collectSonatypeMetrics } from "./sonatype-metrics";
import { getYesterdayDate } from "./utils";

const isLocalPersistence = process.env.PERSIST_LOCAL_FILES === "true";

interface Arguments {
  "collect-gh": boolean;
  "collect-npm": boolean;
  "collect-sonatype": boolean;
  "initial-load-from": string;
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
  "initial-load-from": {
    type: "string",
    description:
      "Execute initial load of metrics for all selected sources from this date in format YYYY-MM-DD",
    default: "",
  },
}).argv as Arguments;

async function main() {
  const initialLoadFrom = argv["initial-load-from"];
  // validate the date format is YYYY-MM-DD
  if (initialLoadFrom && !/^\d{4}-\d{2}-\d{2}$/.test(initialLoadFrom)) {
    throw new Error("Invalid date format. Please use YYYY-MM-DD");
  }

  // by default the metric date is yesterday, because stats services
  // usually provide data for everything until the previous day
  const metricDateStr = getYesterdayDate();

  const metricDate = new Date(metricDateStr);
  const initialLoadFromDate = initialLoadFrom
    ? new Date(initialLoadFrom)
    : undefined;

  const collectNpm = argv["collect-npm"];
  if (collectNpm) {
    console.info(`\n\n============\n\n>>> Collecting metrics for NPM...`);
    if (initialLoadFromDate) {
      await initialLoad(initialLoadFromDate, metricDate, collectNpmMetrics);
    } else {
      await collectNpmMetrics(metricDateStr);
    }
  }

  const collectSonatype = argv["collect-sonatype"];
  if (collectSonatype) {
    await collectSonatypeMetrics(isLocalPersistence);
  }

  const collectGh = argv["collect-gh"];
  if (collectGh) {
    await collectGhMetrics();
  }

  const localCollection = !collectGh && !collectNpm && !collectSonatype;
  if (localCollection) {
    await saveNpmMetrics();
    // await saveGhMetrics();
    // await saveSonatypeMetrics();
  }
}

async function initialLoad(
  initialLoadFromDate: Date,
  initialLoadToDate: Date,
  collectMetrics: (metricDate: string) => Promise<void>
) {
  let date = initialLoadFromDate;
  while (date <= initialLoadToDate) {
    const dateStr = date.toISOString().split("T")[0];
    console.log(`\n\n>>> Collecting metrics for date: ${dateStr}`);
    await collectMetrics(dateStr);
    date.setDate(date.getDate() + 1);
  }
}

main();
