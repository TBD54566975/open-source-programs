import * as fs from "fs";
import * as path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { readJsonFile, writeJsonFile } from "./utils";

// Define the group id to collect metrics for
const groupId = "xyz.block";
const dataFilePath = path.join(process.cwd(), "sonatype_metrics.json");
const csvFilePath = path.join(process.cwd(), "sonatype_metrics.csv");

const sonatypeUsername = process.env.SONATYPE_USERNAME;
const sonatypePassword = process.env.SONATYPE_PASSWORD;

if (!sonatypeUsername || !sonatypePassword) {
  throw new Error(
    "SONATYPE_USERNAME and SONATYPE_PASSWORD must be set in environment variables."
  );
}

const requestHeaders: HeadersInit = {
  Accept: "application/json",
  Authorization: "Basic " + btoa(`${sonatypeUsername}:${sonatypePassword}`),
};

const sonatypeCentralStatsUrl =
  "https://s01.oss.sonatype.org/service/local/stats";

async function collectSonatypeMetrics(isLocalPersistence: boolean = false) {
  const timestamp = new Date().toISOString();
  const projectId = await getProjectId(groupId);
  const artifacts = await getArtifacts(projectId, groupId);
  const metrics = [];

  for (const artifact of artifacts) {
    const [rawDownloads, uniqueIPs] = await Promise.all([
      getArtifactStats(projectId, groupId, artifact, "raw"),
      getArtifactStats(projectId, groupId, artifact, "ip"),
    ]);

    metrics.push({
      artifact,
      timestamp,
      rawDownloads: rawDownloads.total,
      uniqueIPs: uniqueIPs.total,
    });
  }

  console.info("Sonatype metrics collected successfully", { metrics });

  if (isLocalPersistence) {
    const sonatypeMetrics = readJsonFile(dataFilePath);
    for (const metric of metrics) {
      if (!sonatypeMetrics[metric.artifact]) {
        sonatypeMetrics[metric.artifact] = [];
      }
      sonatypeMetrics[metric.artifact].push(metric);
    }
    writeJsonFile(dataFilePath, sonatypeMetrics);
    await writeMetricsToCsv(csvFilePath, sonatypeMetrics);
    console.log(
      "Sonatype metrics have been successfully saved to sonatype_metrics.json and sonatype_metrics.csv"
    );
  }

  return metrics;
}

async function getProjectId(groupId: string): Promise<string> {
  try {
    const response = await fetch(`${sonatypeCentralStatsUrl}/projects`, {
      method: "GET",
      credentials: "include",
      headers: requestHeaders,
    });

    const data = await response.json();
    const project = data.data.find((project: any) => project.name === groupId);
    if (!project) throw new Error(`Project with groupId ${groupId} not found`);

    return project.id;
  } catch (error) {
    console.error(`Error fetching project ID for group ${groupId}:`, error);
    throw error;
  }
}

async function getArtifacts(
  projectId: string,
  groupId: string
): Promise<string[]> {
  try {
    const response = await fetch(
      `${sonatypeCentralStatsUrl}/coord/${projectId}?g=${groupId}`,
      {
        method: "GET",
        credentials: "include",
        headers: requestHeaders,
      }
    );

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching artifacts for group ${groupId}:`, error);
    throw error;
  }
}

async function getArtifactStats(
  projectId: string,
  groupId: string,
  artifactId: string,
  type: string
): Promise<{ total: number }> {
  const from = getLastMonthDate();
  console.info(
    `Fetching ${type} stats for artifact ${artifactId} from ${from}...`
  );

  try {
    const response = await fetch(
      `${sonatypeCentralStatsUrl}/timeline?p=${projectId}&g=${groupId}&a=${artifactId}&t=${type}&from=${from}&nom=1`,
      {
        method: "GET",
        credentials: "include",
        headers: requestHeaders,
      }
    );

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(
      `Error fetching ${type} stats for artifact ${artifactId}:`,
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
    { id: "artifact", title: "Artifact" },
    { id: "rawDownloads", title: "Downloads Last 30d" },
    { id: "uniqueIPs", title: "Downloads Unique IPs Last 30d" },
  ];

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: headers,
    append: fs.existsSync(filePath),
  });

  const records = Object.keys(metrics).map((artifact) => {
    const lastItem = metrics[artifact][metrics[artifact].length - 1];
    return {
      timestamp: lastItem.timestamp,
      artifact: artifact,
      rawDownloads: lastItem.rawDownloads,
      uniqueIPs: lastItem.uniqueIPs,
    };
  });

  await csvWriter.writeRecords(records);
}

function getLastMonthDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // getMonth() returns 0-11, where 0 is January and 11 is December
  const lastMonth = month === 0 ? 12 : month; // If January, use December of the previous year
  const lastMonthYear = month === 0 ? year - 1 : year; // Adjust year if current month is January
  return `${lastMonthYear}${String(lastMonth).padStart(2, "0")}`;
}

export { collectSonatypeMetrics };
