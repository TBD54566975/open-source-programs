import { Octokit } from "@octokit/rest";
import { Endpoints } from "@octokit/types";
import * as fs from "fs";
import * as path from "path";
import { createObjectCsvWriter } from "csv-writer";

const orgName = "TBD54566975";
const repos = [
  "tbdex-swift",
  "tbdex-kt",
  "tbdex-js",
  "tbdex-rs",
  "web5-swift",
  "web5-kt",
  "web5-js",
  "web5-rs",
];

const KNOWN_PAST_MEMBERS = ["amika-sq"];

const dataFilePath = path.join(process.cwd(), "pr_metrics.json");
const csvDataFilePath = path.join(process.cwd(), "pr_metrics.csv");

type ListPullsResponse =
  Endpoints["GET /repos/{owner}/{repo}/pulls"]["response"];

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Read JSON data from the file
function readJsonFile(filePath: string): any {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }
  return {};
}

// Write JSON data to the file
function writeJsonFile(filePath: string, data: any): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// Cache members to avoid rate limiting
const membersCache: Map<string, boolean> = new Map(
  KNOWN_PAST_MEMBERS.map((kpm) => [kpm, true])
);

async function isMember(org: string, username: string): Promise<boolean> {
  if (membersCache.has(username)) {
    return membersCache.get(username) as boolean;
  }

  try {
    const res = await octokit.orgs.checkMembershipForUser({
      org,
      username,
    });
    if (res.status === 302) {
      throw new Error("Forbidden to check membership!");
    } else if (res.status === 204) {
      membersCache.set(username, true);
      console.info("member found in org", username);
      return true;
    } else {
      console.info("member not found in org", username);
      membersCache.set(username, false);
      return false;
    }
  } catch (error) {
    const ghError = error as { status: number };
    if (ghError.status === 404) {
      console.info("member not found in org", username);
      membersCache.set(username, false);
      return false;
    }
    console.info("Error checking membership !!!");
    throw error;
  }
}

async function getAllPulls(org: string, repo: string) {
  let pulls: ListPullsResponse["data"] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await octokit.pulls.list({
      owner: org,
      repo,
      state: "all",
      per_page: 100,
      page,
    });

    pulls = pulls.concat(response.data);
    page++;
    hasMore = response.data.length === 100;
  }

  return pulls;
}

async function getPRMetrics(org: string, repo: string) {
  const pulls = await getAllPulls(org, repo);

  let internalPRs = 0;
  let externalPRs = 0;
  let botPRs = 0;
  let mergedInternalPRs = 0;
  let mergedExternalPRs = 0;
  let mergedBotPRs = 0;
  const internalAuthors: Set<string> = new Set();
  const externalAuthors: Set<string> = new Set();
  const botAuthors: Set<string> = new Set();

  for (const pr of pulls) {
    if (!pr.user) {
      throw new Error("PR user not found!");
    }
    if (pr.user.type === "Bot") {
      botPRs++;
      botAuthors.add(pr.user.login);
      if (pr.merged_at !== null) {
        mergedBotPRs++;
      }
    } else {
      const isInternal = await isMember(org, pr.user.login);
      if (isInternal) {
        internalPRs++;
        internalAuthors.add(pr.user.login);
        if (pr.merged_at !== null) {
          mergedInternalPRs++;
        }
      } else {
        externalPRs++;
        externalAuthors.add(pr.user.login);
        if (pr.merged_at !== null) {
          mergedExternalPRs++;
        }
      }
    }
  }

  const prMetrics = {
    repo,
    totalPRs: pulls.length,
    internalPRs,
    externalPRs,
    botPRs,
    mergedInternalPRs,
    mergedExternalPRs,
    mergedBotPRs,
    openPRs: pulls.filter((pr) => pr.state === "open").length,
    closedPRs: pulls.filter(
      (pr) => pr.state === "closed" && pr.merged_at === null
    ).length,
    internalAuthors: Array.from(internalAuthors).join(", "),
    externalAuthors: Array.from(externalAuthors).join(", "),
    botAuthors: Array.from(botAuthors).join(", "),
  };

  return prMetrics;
}

async function writePRMetricsToCsv(
  filePath: string,
  metrics: any
): Promise<void> {
  const headers = [
    { id: "timestamp", title: "Timestamp" },
    { id: "repo", title: "Repository" },
    { id: "totalPRs", title: "Total PRs" },
    { id: "internalPRs", title: "Internal PRs" },
    { id: "externalPRs", title: "External PRs" },
    { id: "botPRs", title: "Bot PRs" },
    { id: "mergedInternalPRs", title: "Merged Internal PRs" },
    { id: "mergedExternalPRs", title: "Merged External PRs" },
    { id: "mergedBotPRs", title: "Merged Bot PRs" },
    { id: "openPRs", title: "Open PRs" },
    { id: "closedPRs", title: "Closed PRs" },
    { id: "internalAuthors", title: "Internal Authors" },
    { id: "externalAuthors", title: "External Authors" },
    { id: "botAuthors", title: "Bot Authors" },
  ];

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: headers,
    append: fs.existsSync(filePath),
  });

  const records = Object.keys(metrics).map((repo) => {
    const lastItem = metrics[repo][metrics[repo].length - 1];
    return {
      timestamp: lastItem.timestamp,
      repo,
      ...lastItem.metrics,
    };
  });

  await csvWriter.writeRecords(records);
}

export async function collectPRMetrics() {
  console.info(">>> Collecting PR metrics...");
  const data = readJsonFile(dataFilePath);
  for (const repo of repos) {
    const metrics = await getPRMetrics(orgName, repo);
    console.log(metrics);
    const timestamp = new Date().toISOString();
    if (!data[`${orgName}/${repo}`]) {
      data[`${orgName}/${repo}`] = [];
    }
    data[`${orgName}/${repo}`].push({ timestamp, metrics });
  }

  writeJsonFile(dataFilePath, data);
  await writePRMetricsToCsv(csvDataFilePath, data);
  console.log(
    `PR Metrics have been successfully persisted to pr_metrics.json and pr_metrics.csv files.`
  );
}
