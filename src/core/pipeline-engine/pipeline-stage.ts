import type { StageConfig, PipelineContext } from './types.js'

export class PipelineStage {
  private config: StageConfig

  constructor(config: StageConfig) {
    this.config = config
  }

  getName(): string {
    return this.config.name
  }

  getTimeout(): number | undefined {
    return this.config.timeout
  }

  getRetries(): number {
    return this.config.retries ?? 0
  }

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const timeout = this.config.timeout
    const retries = this.config.retries ?? 0
    const maxAttempts = retries + 1

    let lastError: Error | undefined

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        if (timeout !== undefined && timeout > 0) {
          return await this.executeWithTimeout(ctx, timeout)
        }
        return await Promise.resolve(this.config.handler(ctx))
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
      }
    }

    throw lastError ?? new Error(`Stage "${this.config.name}" failed`)
  }

  private executeWithTimeout(ctx: PipelineContext, timeout: number): Promise<PipelineContext> {
    return new Promise<PipelineContext>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Stage "${this.config.name}" timed out after ${timeout}ms`))
      }, timeout)

      Promise.resolve(this.config.handler(ctx))
        .then((result) => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch((err) => {
          clearTimeout(timer)
          reject(err)
        })
    })
  }

  async rollback(ctx: PipelineContext): Promise<void> {
    if (this.config.rollback) {
      await Promise.resolve(this.config.rollback(ctx))
    }
  }
}
