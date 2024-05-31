import * as fs from "fs";
import * as path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { readJsonFile, writeJsonFile } from "./utils";

// Define the npm packages to collect metrics for
const npmPackages = [
  "@tbd54566975/dwn-sdk-js",
  "@web5/common",
  "@web5/credentials",
  "@web5/crypto",
  "@web5/dids",
  "@tbdex/protocol",
  "@tbdex/http-client",
  "@tbdex/http-server",
];

const dataFilePath = path.join(process.cwd(), "npm_metrics.json");
const csvFilePath = path.join(process.cwd(), "npm_metrics.csv");

async function collectNpmMetrics(isLocalPersistence: boolean = false) {
  const timestamp = new Date().toISOString();

  const metrics = [];

  for (const pkg of npmPackages) {
    const [lastMonthDownloads, totalDownloads] = await Promise.all([
      getNpmDownloadCount(pkg, true),
      getNpmDownloadCount(pkg),
    ]);
    metrics.push({
      pkg,
      timestamp,
      publishedAt: totalDownloads.start,
      totalDownloads: totalDownloads.downloads,
      lastMonthDownloads: lastMonthDownloads.downloads,
    });
  }

  console.info("NPM metrics collected successfully", { metrics });

  if (isLocalPersistence) {
    const npmMetrics = readJsonFile(dataFilePath);
    for (const metric of metrics) {
      if (!npmMetrics[metric.pkg]) {
        npmMetrics[metric.pkg] = [];
      }
      npmMetrics[metric.pkg].push(metric);
    }
    writeJsonFile(dataFilePath, npmMetrics);
    await writeMetricsToCsv(csvFilePath, npmMetrics);
    console.log(
      "NPM metrics have been successfully saved to npm_metrics.json and npm_metrics.csv"
    );
  }

  return metrics;
}

async function getNpmDownloadCount(
  packageName: string,
  onlyLastMonth?: boolean
): Promise<{ downloads: number; start: string }> {
  try {
    let url = `https://api.npmjs.org/downloads/point`;
    if (onlyLastMonth) {
      url += `/last-month/${packageName}`;
    } else {
      url += `/1970-01-01:2100-01-01/${packageName}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      `Error fetching download count for package ${packageName}:`,
      error
    );
    throw error;
  }
}

async function writeMetricsToCsv(
  filePath: string,
  metrics: any
): Promise<void> {
  const headers = [
    { id: "timestamp", title: "Timestamp" },
    { id: "package", title: "Package" },
    { id: "totalDownloads", title: "Total Downloads" },
    { id: "lastMonthDownloads", title: "30d Downloads" },
  ];

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: headers,
    append: fs.existsSync(filePath),
  });

  const records = Object.keys(metrics).map((pkg) => {
    const lastItem = metrics[pkg][metrics[pkg].length - 1];
    return {
      timestamp: lastItem.timestamp,
      package: pkg,
      totalDownloads: lastItem.totalDownloads,
      lastMonthDownloads: lastItem.lastMonthDownloads,
    };
  });

  await csvWriter.writeRecords(records);
}

export { collectNpmMetrics };
