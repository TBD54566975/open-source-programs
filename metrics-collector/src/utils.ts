import * as fs from "fs";
import { subDays, format, sub } from "date-fns";
import type { Duration } from "date-fns";

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

  return withRetry(
    () =>
      fetch(url, {
        ...fetchOptions,
      }),
    options
  );

  // let retries = 0;
  // while (retries < maxRetries) {
  //   try {
  //     const controller = new AbortController();
  //     const id = setTimeout(() => controller.abort(), timeout);

  //     const response = await fetch(url, {
  //       ...fetchOptions,
  //       signal: controller.signal,
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.text();
  //       console.error(
  //         `HTTP error! Status: ${response.status}, Response: ${errorData}`
  //       );
  //       throw new Error(
  //         `HTTP error! Status: ${response.status}, Response: ${errorData}`
  //       );
  //     }

  //     clearTimeout(id);

  //     return response;
  //   } catch (error) {
  //     console.error(`Attempt ${retries + 1} failed:`, error);
  //     retries++;
  //     if (retries >= maxRetries) {
  //       throw error;
  //     }
  //     const exponentialDelay = retryDelay * Math.pow(2, retries - 1);
  //     await new Promise((resolve) => setTimeout(resolve, exponentialDelay));
  //   }
  // }
  // throw new Error("Max retries reached");
}

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  { maxRetries = 9, retryDelay = 1000, timeout = 10000 }: RetryOptions = {}
): Promise<T> {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          controller.signal.addEventListener("abort", () =>
            reject(new Error("Operation timed out"))
          )
        ),
      ]);

      clearTimeout(id);
      return result;
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

export function getRelativeDate(durationStr: string): Date {
  const duration = createDuration(durationStr);
  return sub(new Date(), duration);
}

export function createDuration(input: string): Duration {
  const regex = /^-?(\d+)(y|mo|w|d|h|min|s)$/;
  const match = input.match(regex);

  if (!match) {
    throw new Error(
      "Invalid duration format. Use formats like 7d, -1mo, 5y, 2w, 3h, 30min, 45s"
    );
  }

  const [, amount, unit] = match;
  const value = parseInt(amount, 10);
  const duration: Duration = {};

  switch (unit) {
    case "y":
      duration.years = value;
      break;
    case "mo":
      duration.months = value;
      break;
    case "w":
      duration.weeks = value;
      break;
    case "d":
      duration.days = value;
      break;
    case "h":
      duration.hours = value;
      break;
    case "min":
      duration.minutes = value;
      break;
    case "s":
      duration.seconds = value;
      break;
    default:
      throw new Error("Invalid duration unit");
  }

  return duration;
}
