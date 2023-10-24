export function logWithTimestamp(message: string): void {
  const now: Date = new Date();
  const timestamp: string = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  console.log(`[${timestamp}] ${message}`);
}
