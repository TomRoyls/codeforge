export type RetryStrategy = 'fixed' | 'linear' | 'exponential'

export interface RetryOptions {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  strategy: RetryStrategy
  jitter: boolean
}

export class RetryStrategy2 {
  private options: RetryOptions

  constructor(options?: Partial<RetryOptions>) {
    this.options = {
      maxAttempts: 3,
      baseDelay: 100,
      maxDelay: 30000,
      strategy: 'exponential',
      jitter: true,
      ...options,
    }
  }

  getDelay(attempt: number): number {
    let delay: number
    switch (this.options.strategy) {
      case 'fixed':
        delay = this.options.baseDelay
        break
      case 'linear':
        delay = this.options.baseDelay * attempt
        break
      case 'exponential':
      default:
        delay = this.options.baseDelay * Math.pow(2, attempt - 1)
        break
    }
    delay = Math.min(delay, this.options.maxDelay)
    if (this.options.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5)
    }
    return Math.round(delay)
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: unknown
    for (let attempt = 1; attempt <= this.options.maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (err) {
        lastError = err
        if (attempt < this.options.maxAttempts) {
          const delay = this.getDelay(attempt)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    throw lastError
  }

  async executeWithPredicate<T>(
    fn: () => Promise<T>,
    shouldRetry: (error: unknown) => boolean,
  ): Promise<T> {
    let lastError: unknown
    for (let attempt = 1; attempt <= this.options.maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (err) {
        lastError = err
        if (attempt < this.options.maxAttempts && shouldRetry(err)) {
          await new Promise(resolve => setTimeout(resolve, this.getDelay(attempt)))
        } else {
          break
        }
      }
    }
    throw lastError
  }

  setMaxAttempts(n: number): this { this.options.maxAttempts = n; return this }
  setBaseDelay(ms: number): this { this.options.baseDelay = ms; return this }
  setMaxDelay(ms: number): this { this.options.maxDelay = ms; return this }
  setStrategy(strategy: RetryStrategy): this { this.options.strategy = strategy; return this }
  setJitter(enabled: boolean): this { this.options.jitter = enabled; return this }

  getOptions(): Readonly<RetryOptions> { return { ...this.options } }

  static wrap<T>(fn: () => Promise<T>, options?: Partial<RetryOptions>): Promise<T> {
    return new RetryStrategy2(options).execute(fn)
  }

  toArray(): number[] { return [] }
  toString(): string { return JSON.stringify(this.options) }
  toJSON(): RetryOptions { return { ...this.options } }
  clone(): RetryStrategy2 { return new RetryStrategy2(this.options) }
  equals(other: unknown): boolean {
    if (!(other instanceof RetryStrategy2)) return false
    return JSON.stringify(this.options) === JSON.stringify(other.options)
  }
}
