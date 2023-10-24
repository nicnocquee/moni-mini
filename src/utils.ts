export function logWithTimestamp(message: string): void {
  const now: Date = new Date();
  const timestamp: string = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  console.log(`[${timestamp}] ${message}`);
}

export function leftPad(
  input: string,
  length: number,
  paddingChar: string = " "
): string {
  if (input.length >= length) {
    return input;
  }
  const paddingLength = length - input.length;
  const padding = paddingChar.repeat(paddingLength);
  return padding + input;
}
