const fs = require('fs');
const { Parser } = require('json2csv');

const filePath = "./gh_contributions_metrics.json";

// Read JSON data from the file
function readJsonFile(filePath) {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
    }
    return {};
}

const data = readJsonFile(filePath);

function extractData(data) {
    const projects = Object.keys(data);
    const allMonths = new Set();

    // Collect all months from all projects
    projects.forEach(project => {
        data[project].forEach(entry => {
            const { data } = entry;
            Object.values(data).forEach(item => {
                Object.keys(item).forEach(month => {
                    allMonths.add(month);
                });
            });
        });
    });

    const monthsArray = Array.from(allMonths).sort();

    const csvData = [];

    projects.forEach(project => {
        const projectRows = {
            issues: { project: project, type: 'issues' },
            internalMemberIssues: { project: project, type: 'internalMemberIssues' },
            prs: { project: project, type: 'prs' },
            internalMemberPrs: { project: project, type: 'internalMemberPrs' },
            comments: { project: project, type: 'comments' },
            internalMemberComments: { project: project, type: 'internalMemberComments' }
        };

        monthsArray.forEach(month => {
            projectRows.issues[month] = 0;
            projectRows.internalMemberIssues[month] = 0;
            projectRows.prs[month] = 0;
            projectRows.internalMemberPrs[month] = 0;
            projectRows.comments[month] = 0;
            projectRows.internalMemberComments[month] = 0;
        });

        data[project].forEach(entry => {
            const { data } = entry;
            Object.entries(data).forEach(([key, values]) => {
                Object.entries(values).forEach(([month, count]) => {
                    projectRows[key][month] = (projectRows[key][month] || 0) + count;
                });
            });
        });

        csvData.push(projectRows.issues);
        csvData.push(projectRows.internalMemberIssues);
        csvData.push(projectRows.prs);
        csvData.push(projectRows.internalMemberPrs);
        csvData.push(projectRows.comments);
        csvData.push(projectRows.internalMemberComments);
    });

    return { csvData, monthsArray };
}

function buildCSV(data) {
    const { csvData, monthsArray } = extractData(data);
    const fields = ['project', 'type', ...monthsArray];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(csvData);

    fs.writeFileSync('gh_contributions_metrics.csv', csv);
    console.log('CSV file created successfully.');
}

buildCSV(data);
