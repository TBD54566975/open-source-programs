import * as dotenv from "dotenv";
dotenv.config();

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { collectGhMetrics, saveGhMetrics } from "./gh-metrics";
import { collectNpmMetrics } from "./npm-metrics";
import {
  collectSonatypeMetrics,
  saveSonatypeMetrics,
} from "./sonatype-metrics";
import { getYesterdayDate, readJsonFile } from "./utils";
import { readFile, writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { addDays, addMonths, startOfDay } from "date-fns";

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
  "initial-load-to": string;
  "initial-load-state": string;
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
  "initial-load-to": {
    type: "string",
    description:
      "Execute initial load of metrics for all selected sources up until this date in format YYYY-MM-DD",
    default: "",
  },
  "initial-load-state": {
    type: "string",
    description:
      "Set the name of the file that contains the last saved state of the metrics collection",
    default: "",
  },
}).argv as Arguments;

async function main() {
  const initialLoadFrom = argv["initial-load-from"];
  // validate the date format is YYYY-MM-DD
  if (initialLoadFrom && !/^\d{4}-\d{2}-\d{2}$/.test(initialLoadFrom)) {
    throw new Error(
      "Invalid initial-load-from date format. Please use YYYY-MM-DD"
    );
  }
  const initialLoadTo = argv["initial-load-to"];
  // validate the date format is YYYY-MM-DD
  if (initialLoadTo && !/^\d{4}-\d{2}-\d{2}$/.test(initialLoadTo)) {
    throw new Error(
      "Invalid initial-load-to date format. Please use YYYY-MM-DD"
    );
  }

  // by default the metric date is yesterday, because stats services
  // usually provide data for everything until the previous day
  const metricDateStr = getYesterdayDate();

  const metricDate = new Date(
    `${initialLoadTo ?? metricDateStr}T12:00:00.000Z`
  );

  const initialLoadFromDate = initialLoadFrom
    ? new Date(`${initialLoadFrom}T12:00:00.000Z`)
    : undefined;
  const initialLoadToDate = initialLoadTo
    ? new Date(`${initialLoadTo}T12:00:00.000Z`)
    : undefined;

  const initialLoadState = argv["initial-load-state"];

  const collectNpm = argv["collect-npm"];
  if (collectNpm) {
    console.info(`\n\n============\n\n>>> Collecting metrics for NPM...`);
    if (initialLoadFromDate) {
      await initialLoad(
        "npm-metrics",
        initialLoadFromDate,
        metricDate,
        collectNpmMetrics,
        initialLoadState
      );
    } else {
      await collectNpmMetrics(metricDate);
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
        initialLoadState,
        true
      );
    } else {
      await collectSonatypeMetrics(metricDate);
    }
  }

  const collectGh = argv["collect-gh"];
  if (collectGh) {
    console.info(`\n\n============\n\n>>> Collecting metrics for GitHub...`);
    if (initialLoadFromDate) {
      await initialLoad(
        "gh-metrics",
        initialLoadFromDate,
        metricDate,
        collectGhMetrics,
        initialLoadState
      );
    } else {
      await collectGhMetrics(metricDate);
    }
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
  collectMetrics: (metricDate: Date) => Promise<void>,
  initialLoadState: string,
  monthlyInterval = false
) {
  const lastSavedState = await getLastSavedState(metricName, initialLoadState);
  let date = lastSavedState || initialLoadFromDate;

  console.info(
    `Initial load from ${initialLoadFromDate} to ${initialLoadToDate} with date ${date}`
  );

  while (date <= initialLoadToDate) {
    const dateStr = date.toISOString().split("T")[0];
    const startOfDayDate = new Date(`${dateStr}T00:00:00.000Z`);
    console.log(`\n\n>>> Collecting metric ${metricName} for date: ${dateStr}`);
    await collectMetrics(startOfDayDate);
    date = monthlyInterval ? addMonths(date, 1) : addDays(date, 1);
    console.log(
      `Saving last saved state for ${metricName} to ${date.toISOString()}`
    );
    await saveLastSavedState(metricName, initialLoadState, date);
  }
}

export const getLastSavedState = async (
  metricName: string,
  initialLoadState: string
) => {
  const filePath = `./data/last-saved-state-${initialLoadState}-${metricName}`;
  if (!existsSync(filePath)) {
    return undefined;
  }
  const lastSavedState = await readFile(filePath);
  return new Date(lastSavedState.toString("utf8"));
};

export const saveLastSavedState = (
  metricName: string,
  initialLoadState: string,
  date: Date
) => {
  const dataDir = "./data";
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  const filePath = `${dataDir}/last-saved-state-${initialLoadState}-${metricName}`;
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
