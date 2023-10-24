import ky from "ky";
import { logWithTimestamp } from "@/utils";
import { Data } from "@/process-queue";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 3;

export default async (data: Data) => {
  let retries = 0;

  logWithTimestamp(`[${data.id}]: Start probing ${data.urls.join(",")}`);

  while (retries < MAX_RETRIES) {
    try {
      const result = [];
      for (const url of data.urls) {
        const start = Date.now();
        const response = await ky(url, {
          throwHttpErrors: false,
          hooks: {
            beforeRetry: [
              async ({ retryCount, error }) => {
                logWithTimestamp(
                  `[${
                    data.id
                  }]: Retry #${retryCount} ${url}. Error: ${JSON.stringify(
                    error
                  )}`
                );
              },
            ],
          },
          retry: {
            limit: 5,
            backoffLimit: 5000, // 0.3 * (2 ** (attemptCount - 1)) * 5000
          },
        });
        const end = Date.now();
        let size = 0;
        const contentLength = response.headers.get("Content-Length");
        if (contentLength !== null) {
          size = parseInt(contentLength, 10);
        } else if (response.body) {
          const reader = response.body.getReader();
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            size += value.length;
          }
        }
        result.push({ duration: end - start, size });
      }

      logWithTimestamp(
        `[${data.id}]: Finish probing with result: ${result
          .map((r) => `${r.duration}ms,${r.size}bytes`)
          .join(`,`)}`
      );

      return result;
    } catch (error: any) {
      retries++;
      const backoffTime = Math.pow(2, retries) * 1000; // Exponential backoff in milliseconds

      if (error.name === "TimeoutError") {
        logWithTimestamp(
          `[${data.id}]: Request timeout. Will try again in ${
            backoffTime / 1000
          } seconds`
        );
      } else {
        logWithTimestamp(
          `[${data.id}]: Request error: ${JSON.stringify(
            error
          )}. Will try again in ${backoffTime / 1000} seconds.`
        );
      }

      await sleep(backoffTime);
    }
  }

  logWithTimestamp(`[${data.id}]: Stop retrying.`);

  throw new Error(
    `Failed to probe ${data.urls.join(",")} after ${MAX_RETRIES} retries`
  );
};
