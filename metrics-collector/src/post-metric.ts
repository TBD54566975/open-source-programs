const metricsServiceAppUrl = 'http://localhost:3001/api/v1' // TODO: change to env

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
      throw new Error(`Error posting metric: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Metric posted successfully:", JSON.stringify(payload));
  } catch (error) {
    console.error("Error posting metric:", error);
  }
};
