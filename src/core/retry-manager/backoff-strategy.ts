import type { RetryConfig } from './types.js'
import { DEFAULT_RETRY_CONFIG } from './types.js'

export class BackoffStrategy {
  private readonly config: RetryConfig

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config }
  }

  calculateDelay(attempt: number): number {
    const delay = this.config.initialDelay * Math.pow(this.config.backoffMultiplier, attempt)
    return Math.min(delay, this.config.maxDelay)
  }

  addJitter(delay: number): number {
    return delay * (0.5 + Math.random() * 0.5)
  }

  getMaxDelay(): number {
    return this.config.maxDelay
  }

  getInitialDelay(): number {
    return this.config.initialDelay
  }

  getConfig(): RetryConfig {
    return { ...this.config }
  }
}
