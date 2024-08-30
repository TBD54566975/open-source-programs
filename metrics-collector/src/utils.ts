import * as fs from "fs";
import { subDays, format } from "date-fns";

// Read JSON data from the file
export function readJsonFile(filePath: string): any {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }
  return {};
}

// Write JSON data to the file
export function writeJsonFile(filePath: string, data: any): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

export const getYesterdayDate = () => {
  const yesterday = subDays(new Date(), 1);
  return format(yesterday, "yyyy-MM-dd");
};

interface FetchWithRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit & FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 9,
    retryDelay = 1000,
    timeout = 10000,
    ...fetchOptions
  } = options;

  let retries = 0;
  while (retries < maxRetries) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(
          `HTTP error! Status: ${response.status}, Response: ${errorData}`
        );
        throw new Error(
          `HTTP error! Status: ${response.status}, Response: ${errorData}`
        );
      }

      clearTimeout(id);

      return response;
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      retries++;
      if (retries >= maxRetries) {
        throw error;
      }
      const exponentialDelay = retryDelay * Math.pow(2, retries - 1);
      await new Promise((resolve) => setTimeout(resolve, exponentialDelay));
    }
  }
  throw new Error("Max retries reached");
}
