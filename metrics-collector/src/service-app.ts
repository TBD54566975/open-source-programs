const express = require("express");
import * as dotenv from "dotenv";
const { Pool } = require("pg");
const app = express();
app.use(express.json());

// Load environment variables from .env file
dotenv.config();

const getDbConfig = () => {
  const user = process.env.DB_USER;
  const host = process.env.DB_HOST;
  const database = process.env.DB_NAME;
  const password = process.env.DB_PASSWORD;
  const port = process.env.DB_PORT;

  // throws an error if any of the required environment variables are missing
  if (!user || !host || !database || !password || !port) {
    throw new Error(
      "Missing required DB Config environment variables: DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT"
    );
  }

  return { user, host, database, password, port: parseInt(port) };
};

const pool = new Pool(getDbConfig());

// Initialize the database schema
const initDb = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS metrics (
        id SERIAL PRIMARY KEY,
        metric_name VARCHAR(255) NOT NULL,
        value DOUBLE PRECISION NOT NULL,
        labels JSONB,
        metric_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_metric_name ON metrics(metric_name);
    CREATE INDEX IF NOT EXISTS idx_metric_timestamp ON metrics(metric_timestamp);
    CREATE INDEX IF NOT EXISTS idx_metric_labels ON metrics USING GIN(labels);
    `;
  await pool.query(createTableQuery);
  console.log("Database initialized");

  // Seed the database with fake metrics
  await seedDb();
};

// Seed function to populate the database with fake metrics
const seedDb = async () => {
  // Check if the metrics table is empty
  const res = await pool.query("SELECT COUNT(*) FROM metrics");
  if (parseInt(res.rows[0].count, 10) > 0) {
    console.log("Metrics table already has data, skipping seed.");
    return;
  }

  console.info("Seeding database with fake metrics...");

  const repositories = ["myorg/repo1", "myorg/repo2", "myorg/repo3"];
  const metricName = "fake_github_stars";
  const now = new Date();
  const values = [];

  for (let i = 0; i < 100; i++) {
    const repo = repositories[Math.floor(Math.random() * repositories.length)];
    const value = Math.floor(Math.random() * 100) + 1; // Random stars count between 1 and 100
    const timestamp = new Date(
      now.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    ); // Random date within the last 30 days
    values.push({
      metricName,
      value,
      labels: { repository: repo },
      timestamp: timestamp.toISOString(),
    });
  }

  // Sort values by timestamp
  values.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const insertQuery = `
    INSERT INTO metrics (metric_name, value, labels, metric_timestamp) VALUES ($1, $2, $3, $4)
    `;

  for (const val of values) {
    await pool.query(insertQuery, [
      val.metricName,
      val.value,
      val.labels,
      val.timestamp,
    ]);
  }

  console.log("Database seeded with fake metrics");
};

if (!process.env.DB_SKIP_INIT) {
  initDb();
}

// Collect Metrics Endpoint
app.post("/api/v1/metrics", async (req: any, res: any) => {
  const { metricName, value, labels, timestamp } = req.body;
  if (!metricName || value == undefined) {
    return res
      .status(400)
      .send({ error: "Missing required fields: metricName and value" });
  }

  try {
    await pool.query(
      "INSERT INTO metrics (metric_name, value, labels, metric_timestamp) VALUES ($1, $2, $3, $4)",
      [
        metricName,
        value,
        labels || undefined,
        timestamp || new Date().toISOString(),
      ]
    );
    console.info(
      ">>> Metric collected: ",
      JSON.stringify({ metricName, value, labels, timestamp })
    );
    res.status(201).send({ message: "Metric collected" });
  } catch (err) {
    res.status(500).send({ error: "Failed to collect metric" });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});

/*

# Example Grafana Queries

## Sum of Metric Values by Day
```sql
SELECT
  date_trunc('day', timestamp) AS time,
  SUM(value) AS total_value
FROM metrics
WHERE metric_name = 'github_stars'
AND timestamp BETWEEN $__timeFrom() AND $__timeTo()
GROUP BY 1
ORDER BY 1
```

## Average Metric Value Over Time
```sql
SELECT
  date_trunc('hour', timestamp) AS time,
  AVG(value) AS avg_value
FROM metrics
WHERE metric_name = 'github_stars'
AND timestamp BETWEEN $__timeFrom() AND $__timeTo()
GROUP BY 1
ORDER BY 1
```

## Filtering by Labels
```sql
SELECT
  date_trunc('day', timestamp) AS time,
  SUM(value) AS total_value
FROM metrics
WHERE metric_name = 'github_stars'
AND labels->>'repository' = 'my-repo'
AND timestamp BETWEEN $__timeFrom() AND $__timeTo()
GROUP BY 1
ORDER BY 1
```

## Schema and selects
```sql
CREATE TABLE metrics (
    id SERIAL PRIMARY KEY,
    metric_name TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    labels JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX idx_metric_name ON metrics(metric_name);
CREATE INDEX idx_timestamp ON metrics(timestamp);
CREATE INDEX idx_labels ON metrics USING GIN(labels);



SELECT *
FROM metrics
WHERE metric_name = 'github_stars'
AND labels->>'repository' = 'my-repo';

SELECT *
FROM metrics
WHERE metric_name = 'github_stars'
AND labels @> '{"repository": "my-repo", "language": "JavaScript"}';


# Extract All Unique Keys
SELECT DISTINCT jsonb_object_keys(labels) AS key
FROM metrics;

# Get Unique Key-Value Pairs
SELECT DISTINCT key, value
FROM (
    SELECT jsonb_each_text(labels) AS kv
    FROM metrics
) AS key_values;

# Extract All Unique Values for a Specific Key
SELECT DISTINCT labels->>'your_key' AS value
FROM metrics
WHERE labels ? 'your_key';

# or maintain a separate table with a trigger to sync
CREATE TABLE unique_labels (
    key VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    PRIMARY KEY (key, value)
);

CREATE OR REPLACE FUNCTION update_unique_labels() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO unique_labels (key, value)
    SELECT jsonb_object_keys(NEW.labels), jsonb_each_text(NEW.labels)::text
    ON CONFLICT (key, value) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_unique_labels
AFTER INSERT ON metrics
FOR EACH ROW
EXECUTE FUNCTION update_unique_labels();
```

*/
