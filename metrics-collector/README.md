# metrics-collector

Small script to collect open source metrics across TBD

Usage:

```sh
cp .env.example .env

# insert your GH Token in the env

pnpm i
pnpm start
```

See the collected metrics at:

- `pr_metrics.json` or `pr_metrics.csv`
- TODO: `usage_metrics.json`...

## metrics service

```sh
docker compose build
docker compose up

# test multiple concurrent requests
hey -n 1000 -c 50 -m POST -H "Content-Type: application/json" -d '{"metricName":"test_concurrent_metric","value":1,"labels":{"test":"concurrency"},"operation":"increment"}' http://localhost:3001/api/v1/metrics
```
