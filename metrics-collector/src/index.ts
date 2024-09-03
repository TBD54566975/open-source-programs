import * as dotenv from "dotenv";
dotenv.config();

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { saveGhMetrics } from "./gh-metrics";
import { collectNpmMetrics } from "./npm-metrics";
import {
  collectSonatypeMetrics,
  saveSonatypeMetrics,
} from "./sonatype-metrics";
import { getYesterdayDate, readJsonFile } from "./utils";
import { readFile, writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";

const isLocalPersistence = process.env.PERSIST_LOCAL_FILES === "true";

const TIMEOUT = 30 * 60 * 1000;
setTimeout(() => {
  console.error("Execution timed out after", TIMEOUT / 60000, "minutes");
  process.exit(1);
}, TIMEOUT);

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
    ? new Date(`${initialLoadFrom}T00:00:00.000Z`)
    : undefined;

  const collectNpm = argv["collect-npm"];
  if (collectNpm) {
    console.info(`\n\n============\n\n>>> Collecting metrics for NPM...`);
    if (initialLoadFromDate) {
      await initialLoad(
        "npm-metrics",
        initialLoadFromDate,
        metricDate,
        collectNpmMetrics
      );
    } else {
      await collectNpmMetrics(metricDateStr);
    }
  }

  const collectSonatype = argv["collect-sonatype"];
  if (collectSonatype) {
    console.info(
      `\n\n============\n\n>>> Collecting metrics for Maven Sonatype...`
    );
    if (initialLoadFromDate) {
      await initialLoad(
        "sonatype-metrics",
        initialLoadFromDate,
        metricDate,
        collectSonatypeMetrics,
        true
      );
    } else {
      await collectSonatypeMetrics(metricDateStr);
    }
  }

  const collectGh = argv["collect-gh"];
  if (collectGh) {
    console.info(`\n\n============\n\n>>> Collecting metrics for GitHub...`);
    await saveGhMetrics();
  }

  const localCollection = !collectGh && !collectNpm && !collectSonatype;
  if (localCollection) {
    console.info(`\n\n============\n\n>>> Collecting local metrics...`);
    // await saveNpmMetrics();
    await saveSonatypeMetrics();
    // await collectGhMetrics(true);
  }
}

async function initialLoad(
  metricName: string,
  initialLoadFromDate: Date,
  initialLoadToDate: Date,
  collectMetrics: (metricDate: string) => Promise<void>,
  monthlyInterval = false,
  skipLastSavedState = false
) {
  const lastSavedState =
    !skipLastSavedState && (await getLastSavedState(metricName));
  const date = lastSavedState || initialLoadFromDate;

  console.info(
    `Initial load from ${initialLoadFromDate} to ${initialLoadToDate} with date ${date}`
  );

  while (date <= initialLoadToDate) {
    const dateStr = date.toISOString().split("T")[0];
    console.log(`\n\n>>> Collecting metric ${metricName} for date: ${dateStr}`);
    await collectMetrics(dateStr);
    if (monthlyInterval) {
      // Move to the next month (JS will handle year change automatically)
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setDate(date.getDate() + 1);
    }
    await saveLastSavedState(metricName, date);
  }
}

export const getLastSavedState = async (metricName: string) => {
  const filePath = `./data/last-saved-state-${metricName}`;
  if (!existsSync(filePath)) {
    return undefined;
  }
  const lastSavedState = await readFile(filePath);
  return new Date(lastSavedState.toString("utf8"));
};

export const saveLastSavedState = (metricName: string, date: Date) => {
  const dataDir = "./data";
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  const filePath = `${dataDir}/last-saved-state-${metricName}`;
  return writeFile(filePath, date.toISOString());
};

main()
  .then(() => {
    console.log("Data collection completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Data collection failed", error);
    process.exit(1);
  });
