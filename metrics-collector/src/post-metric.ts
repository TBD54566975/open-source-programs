import { fetchWithRetry } from "./utils";

const metricsServiceAppUrl = process.env.METRICS_SERVICE_APP_HOST_URL;

interface Labels {
  [key: string]: string;
}

export interface MetricPayload {
  metricName: string;
  value: number;
  labels: Labels;
  timestamp?: string;
}

export const postMetric = async (payload: MetricPayload): Promise<void> => {
  payload.timestamp = payload.timestamp ?? new Date().toISOString();
  console.info({ payload });

  const response = await fetchWithRetry(`${metricsServiceAppUrl}/metrics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.body) {
      const error = await response.json();
      console.error("Errored response body:", { error });
    }
    throw new Error(`Error posting metric: ${response.statusText}`);
  }

  console.info("Metric posted successfully:", JSON.stringify(payload));
};
