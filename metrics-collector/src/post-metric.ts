const metricsServiceAppUrl = process.env.METRICS_SERVICE_APP_HOST_URL;

interface Labels {
  [key: string]: string;
}

interface MetricPayload {
  metricName: string;
  value: number;
  labels: Labels;
  timestamp?: string;
}

export const postMetric = async (
  metricName: string,
  value: number,
  labels: Labels,
  timestamp?: Date
): Promise<void> => {
  const payload: MetricPayload = {
    metricName,
    value: value,
    labels: labels,
    timestamp: (timestamp || new Date()).toISOString(),
  };

  try {
    const response = await fetch(`${metricsServiceAppUrl}/metrics`, {
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

    console.log("Metric posted successfully:", JSON.stringify(payload));
  } catch (error) {
    console.error("Error posting metric:", error, JSON.stringify(error));
  }
};
