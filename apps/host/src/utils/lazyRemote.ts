type ImportFactory<T> = () => Promise<T>;

type RetryOptions = {
  attempts?: number;
  delayMs?: number;
  backoffMs?: number;
};

const wait = (delayMs: number) =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, delayMs);
  });

export async function importWithRetry<T>(
  factory: ImportFactory<T>,
  { attempts = 5, delayMs = 900, backoffMs = 350 }: RetryOptions = {}
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await factory();
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        await wait(delayMs + backoffMs * (attempt - 1));
      }
    }
  }

  throw lastError;
}
