import { logWithTimestamp } from "@/utils";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

type Data = { id: string };
const MAX_RETRIES = 3;

export default async (data: Data) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // Your actual processing logic here
      const rand = randomBetween(4, 12);
      logWithTimestamp(`${data.id}: Start for ${rand} seconds`);
      await sleep(rand * 1000);
      logWithTimestamp(`${data.id}: Finish`);
      return "Success";
    } catch (error) {
      logWithTimestamp(error as any);
      retries++;
      const backoffTime = Math.pow(2, retries) * 1000; // Exponential backoff in milliseconds
      console.error(
        `Error processing ${JSON.stringify(data)}, Retrying in ${
          backoffTime / 1000
        }...`
      );

      await sleep(backoffTime);
    }
  }

  logWithTimestamp(`throwing error`);

  throw new Error(
    `Failed to process ${JSON.stringify(data)} after ${MAX_RETRIES} retries`
  );
};
