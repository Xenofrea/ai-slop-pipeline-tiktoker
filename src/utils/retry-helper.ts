export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

export class RetryHelper {
  /**
   * Проверяет, является ли ошибка non-recoverable (нет смысла делать retry)
   */
  static isNonRecoverableError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();

    // Content policy violation - промпт заблокирован модерацией
    if (errorMessage.includes('content_policy_violation') ||
        errorMessage.includes('content could not be processed')) {
      return true;
    }

    // Authentication errors
    if (errorMessage.includes('unauthorized') ||
        errorMessage.includes('invalid api key') ||
        errorMessage.includes('authentication failed')) {
      return true;
    }

    // Invalid parameters
    if (errorMessage.includes('invalid parameter') ||
        errorMessage.includes('validation error')) {
      return true;
    }

    return false;
  }

  static async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delayMs = 2000,
      backoffMultiplier = 2,
      onRetry,
      shouldRetry,
    } = options;

    let lastError: Error;
    let currentDelay = delayMs;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Проверяем, нужен ли retry для этой ошибки
        const shouldAttemptRetry = shouldRetry
          ? shouldRetry(lastError)
          : !this.isNonRecoverableError(lastError);

        // Если это последняя попытка или ошибка non-recoverable - пробрасываем
        if (attempt === maxAttempts || !shouldAttemptRetry) {
          if (!shouldAttemptRetry) {
            console.log(`⚠️  Non-recoverable ошибка (retry пропущен): ${lastError.message}`);
          }
          throw lastError;
        }

        if (onRetry) {
          onRetry(attempt, lastError);
        }

        // Ждём перед следующей попыткой
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= backoffMultiplier;
      }
    }

    throw lastError!;
  }
}
