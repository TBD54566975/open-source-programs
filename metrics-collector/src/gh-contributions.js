const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");
const { Octokit } = require("@octokit/rest");
const moment = require('moment');

let octokit;

const orgName = "TBD54566975";
const repos = [
    "tbdex-js",
    "tbdex-kt",
    "tbdex-swift",
    "tbdex-rs",
    "web5-js",
    "web5-kt",
    "web5-swift",
    "web5-rs",
    // "dwn-sdk-js",
];

const KNOWN_PAST_MEMBERS = ["amika-sq"];

const KNOWN_BOTS = ['codecov-commenter', 'dependabot[bot]', 'renovate[bot]'];

// Cache members to avoid rate limiting
const membersCache = new Map(
    KNOWN_PAST_MEMBERS.map((kpm) => [kpm, true])
);

async function fetchIssues(owner, repo) {
    const issues = [];
    let page = 1;
    while (true) {
        const { data } = await octokit.issues.listForRepo({
            owner,
            repo,
            state: 'all',
            per_page: 100,
            page
        });

        const filteredIssues = data.filter(issue => !issue.pull_request);
        issues.push(...filteredIssues);

        if (data.length < 100) break;
        page++;
    }
    return issues;
}

async function fetchPullRequests(owner, repo) {
    const prs = [];
    let page = 1;
    while (true) {
        const { data } = await octokit.pulls.list({
            owner,
            repo,
            state: 'all',
            per_page: 100,
            page
        });
        prs.push(...data);
        if (data.length < 100) break;
        page++;
    }
    return prs;
}

async function fetchComments(owner, repo) {
    const comments = [];
    let page = 1;
    while (true) {
        const { data } = await octokit.issues.listCommentsForRepo({
            owner,
            repo,
            per_page: 100,
            page
        });
        comments.push(...data);
        if (data.length < 100) break;
        page++;
    }
    return comments;
}

async function isMember(org, user) {
    const username = user.login;
    if (membersCache.has(username)) {
        return membersCache.get(username);
    }

    if (user.type === 'Bot' || KNOWN_BOTS.includes(user.login)) {
        console.info("Skipping bot", user.login);
        membersCache.set(username, true);
        return true;
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
        const ghError = error;
        if (ghError.status === 404) {
            console.info("member not found in org", username);
            membersCache.set(username, false);
            return false;
        }
        console.info("Error checking membership !!!");
        throw error;
    }
}

async function aggregateData(owner, repo) {
    const [issues, prs, comments] = await Promise.all([
        fetchIssues(owner, repo),
        fetchPullRequests(owner, repo),
        fetchComments(owner, repo)
    ]);
    console.info(`Fetched ${issues.length} issues, ${prs.length} PRs, and ${comments.length} comments for ${owner}/${repo}`);

    const now = moment();
    const beginningTime = now.clone().subtract(3, 'months');

    const monthlyData = {
        issues: {},
        prs: {},
        comments: {}
    };

    function addToMonthlyData(type, date) {
        const month = moment(date).startOf('month').format('YYYY-MM');
        if (!monthlyData[type][month]) monthlyData[type][month] = 0;
        monthlyData[type][month]++;
    }

    console.info("Computing issues numbers...");
    for (const issue of issues) {
        const member = await isMember(owner, issue.user);
        if (!member && moment(issue.created_at).isAfter(beginningTime)) {
            addToMonthlyData('issues', issue.created_at);
            // print issue details with link
            console.info(`[${issue.user.login}]: ${issue.title} (${issue.html_url})`);
        }
    };

    console.info("Computing PRs numbers...");
    for (const pr of prs) {
        const member = await isMember(owner, pr.user);
        if (!member && moment(pr.created_at).isAfter(beginningTime)) {
            addToMonthlyData('prs', pr.created_at);
            // print PR details with link
            console.info(`[${pr.user.login}]: ${pr.title} (${pr.html_url})`);
        }
    };

    console.info("Computing comments numbers...");
    for (const comment of comments) {
        const member = await isMember(owner, comment.user);
        if (!member && moment(comment.created_at).isAfter(beginningTime)) {
            addToMonthlyData('comments', comment.created_at);
            // print comment details with link
            console.info(`[${comment.user.login}]: ${comment.body.substring(0, 48)}... (${comment.html_url})`);
        }
    };

    return monthlyData;
}

const filePath = "./gh_contributions_metrics.json";

// Read JSON data from the file
function readJsonFile(filePath) {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
    }
    return {};
}

// Write JSON data to the file
function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

(async () => {
    if (!process.env.GITHUB_TOKEN) {
        throw new Error("GITHUB_TOKEN is not set!");
    }

    octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
    });

    const jsonData = readJsonFile(filePath);

    for (const repo of repos) {
        try {
            console.info(`Aggregating data for ${orgName}/${repo}...`);
            const data = await aggregateData(orgName, repo);
            console.log('Aggregated Data for Last 3 Months:', data);

            if (!jsonData[repo]) {
                jsonData[repo] = [];
            }

            jsonData[repo].push({ timestamp: new Date().toISOString(), data });
            writeJsonFile(filePath, jsonData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
})();