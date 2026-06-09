export class RateLimiter2 {
  private maxRequests: number;
  private windowMs: number;
  private timestamps: number[] = [];

  constructor(options: { maxRequests: number; windowMs: number }) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
  }

  tryAcquire(): boolean {
    const now = Date.now();
    this.cleanupOldTimestamps(now);

    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(now);
      return true;
    }

    return false;
  }

  async acquire(): Promise<void> {
    while (true) {
      const now = Date.now();
      this.cleanupOldTimestamps(now);

      if (this.timestamps.length < this.maxRequests) {
        this.timestamps.push(now);
        return;
      }

      const oldestTimestamp = this.timestamps[0]!;
      const waitTime = oldestTimestamp + this.windowMs - now;

      await new Promise((resolve) => setTimeout(resolve, Math.max(0, waitTime)));
    }
  }

  getAvailableTokens(): number {
    this.cleanupOldTimestamps(Date.now());
    return this.maxRequests - this.timestamps.length;
  }

  reset(): void {
    this.timestamps = [];
  }

  private cleanupOldTimestamps(now: number): void {
    const cutoff = now - this.windowMs;
    let i = 0;

    while (i < this.timestamps.length && this.timestamps[i]! < cutoff) {
      i++;
    }

    this.timestamps = this.timestamps.slice(i);
  }

  toString(): string {
    return `RateLimiter2()`
  }
}
