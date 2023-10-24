import ky from "ky";
import { leftPad, logWithTimestamp } from "@/utils";
import { Data } from "@/process-queue";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 3;

export default async (data: Data) => {
  let retries = 0;

  const paddedId = leftPad(data.id, 4, "0");
  // logWithTimestamp(`[${data.id}]: Start probing ${data.urls.join(",")}`);

  while (retries < MAX_RETRIES) {
    try {
      const result = [];
      for (const url of data.urls) {
        const start = Date.now();
        const response = await ky(url, {
          throwHttpErrors: false,
          timeout: 10 * 1000,
          hooks: {
            beforeRetry: [
              async ({ retryCount, error }) => {
                logWithTimestamp(
                  `[${paddedId}]: Retry #${retryCount} ${url}. Error: ${JSON.stringify(
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

        if (
          assertResponse({
            status: response.status,
            size,
            duration: end - start,
          })
        ) {
          result.push({ duration: end - start, size, status: response.status });
        } else {
          throw new Error(`ASSERTION_FAILED`);
        }
      }

      logWithTimestamp(
        `[${paddedId}]: ${result
          .map((r) => `${r.duration}ms,${r.size}bytes,${r.status}`)
          .join(`,`)}`
      );

      return result;
    } catch (error: any) {
      retries++;
      const backoffTime = Math.pow(2, retries) * 1000; // Exponential backoff in milliseconds

      if (error.name === "TimeoutError") {
        logWithTimestamp(
          `[${paddedId}]: Request timeout (Attempt #${retries}). Retry in ${
            backoffTime / 1000
          } seconds`
        );
      } else if (error.message === "ASSERTION_FAILED") {
        logWithTimestamp(
          `[${paddedId}]: ASSERTION_FAILED (Attempt #${retries}). Retry in ${
            backoffTime / 1000
          } seconds.`
        );
      } else {
        logWithTimestamp(
          `[${paddedId}]: Request error: ${JSON.stringify(
            error
          )} (Attempt #${retries}). Retry in ${backoffTime / 1000} seconds.`
        );
      }

      await sleep(backoffTime);
    }
  }

  const message = `[${paddedId}]: Failed to probe ${data.urls.join(
    ","
  )} after ${MAX_RETRIES} retries. Send notification or something.`;
  logWithTimestamp(message);

  throw new Error(message);
};

const assertResponse = ({
  status,
}: {
  duration: number;
  size: number;
  status: number;
}) => {
  // do some other assertion here
  if (status !== 200) {
    return false;
  }
  return true;
};
