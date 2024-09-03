import * as fs from "fs";
import * as path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { parse, format, subMonths } from "date-fns";
import { fetchWithRetry, readJsonFile, writeJsonFile } from "./utils";
import { postMetric } from "./post-metric";

// Define the group id to collect metrics for
const groupId = "xyz.block";
const dataFilePath = path.join(process.cwd(), "sonatype_metrics.json");
const csvFilePath = path.join(process.cwd(), "sonatype_metrics.csv");

const requestHeaders: Record<string, string> = {
  Accept: "application/json",
};

const sonatypeCentralStatsUrl =
  "https://s01.oss.sonatype.org/service/local/stats";

export async function collectSonatypeMetrics(metricDate: string) {
  initAuth();

  const projectId = await getProjectId(groupId);
  const artifacts = await getArtifacts(projectId, groupId);

  for (const artifact of artifacts) {
    if (!["tbdex", "web5"].find((a) => artifact.includes(a))) {
      continue; // TODO: add parameterized filter
    }

    const reportPeriod = getLastMonthPeriod(metricDate);
    const reportPeriodWithoutHyphen = reportPeriod.replace("-", "");

    const rawDownloads = await getArtifactStats(
      projectId,
      groupId,
      artifact,
      "raw",
      reportPeriodWithoutHyphen
    );
    const uniqueIPs = await getArtifactStats(
      projectId,
      groupId,
      artifact,
      "ip",
      reportPeriodWithoutHyphen
    );

    await postSonatypeMavenMetrics({
      artifact,
      metricDate: new Date(metricDate),
      reportPeriod,
      rawDownloads: rawDownloads.total,
      uniqueIPs: uniqueIPs.total,
    });

    await new Promise((resolve) => setTimeout(resolve, 5000)); // to avoid Sonatype rate limit
  }
}

async function postSonatypeMavenMetrics(metric: {
  artifact: string;
  metricDate: Date;
  reportPeriod: string;
  rawDownloads: number;
  uniqueIPs: number;
}) {
  console.info("posting sonatype metric", { metric });
  const labels = {
    artifact: metric.artifact,
    reportPeriod: metric.reportPeriod,
  };

  await postMetric({
    metricName: "sonatype_central_stats_downloads_last_month",
    value: metric.rawDownloads,
    labels,
    timestamp: metric.metricDate.toISOString(),
  });

  await postMetric({
    metricName: "sonatype_central_stats_unique_ips_downloads_last_month",
    value: metric.uniqueIPs,
    labels,
    timestamp: metric.metricDate.toISOString(),
  });
}

export async function saveSonatypeMetrics() {
  initAuth();

  const timestamp = new Date().toISOString();
  const projectId = await getProjectId(groupId);
  const artifacts = await getArtifacts(projectId, groupId);
  const metrics = [];

  for (const artifact of artifacts) {
    if (!["tbdex", "web5"].find((a) => artifact.includes(a))) {
      continue;
    }

    const rawDownloads = await getArtifactStats(
      projectId,
      groupId,
      artifact,
      "raw"
    );
    const uniqueIPs = await getArtifactStats(
      projectId,
      groupId,
      artifact,
      "ip"
    );

    const artifactMetrics = {
      artifact,
      timestamp,
      rawDownloads: rawDownloads.total,
      uniqueIPs: uniqueIPs.total,
    };
    console.info({ [artifact]: artifactMetrics });
    metrics.push(artifactMetrics);
    await new Promise((resolve) => setTimeout(resolve, 5000)); // prevent rate limit
  }

  console.info("Sonatype metrics collected successfully", { metrics });

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

  return metrics;
}

const initAuth = () => {
  const sonatypeUsername = process.env.SONATYPE_USERNAME;
  const sonatypePassword = process.env.SONATYPE_PASSWORD;
  if (!sonatypeUsername || !sonatypePassword) {
    throw new Error(
      "SONATYPE_USERNAME and SONATYPE_PASSWORD must be set in environment variables."
    );
  }
  requestHeaders.Authorization =
    "Basic " + btoa(`${sonatypeUsername}:${sonatypePassword}`);
};

async function getProjectId(groupId: string): Promise<string> {
  try {
    const response = await fetchWithRetry(
      `${sonatypeCentralStatsUrl}/projects`,
      {
        method: "GET",
        credentials: "include",
        headers: requestHeaders,
      }
    );

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
    const response = await fetchWithRetry(
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
  type: string,
  reportPeriod?: string
): Promise<{ total: number }> {
  const from = reportPeriod ?? getLastMonthDate();
  console.info(
    `Fetching ${type} stats for artifact ${artifactId} from ${from}...`
  );

  try {
    const response = await fetchWithRetry(
      `${sonatypeCentralStatsUrl}/timeline?p=${projectId}&g=${groupId}&a=${artifactId}&t=${type}&from=${from}&nom=1`,
      {
        method: "GET",
        credentials: "include",
        headers: requestHeaders,
      }
    );

    const responseText = await response.text();
    try {
      const data = JSON.parse(responseText);
      return data.data;
    } catch (error) {
      console.error(
        "Failed to parse response as JSON:",
        response.status,
        response.statusText,
        responseText
      );
      throw new Error("Unable to parse response as JSON");
    }
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

function getLastMonthPeriod(date: string): string {
  const parsedDate = parse(date, "yyyy-MM-dd", new Date());
  const previousMonth = subMonths(parsedDate, 1);
  return format(previousMonth, "yyyy-MM");
}
