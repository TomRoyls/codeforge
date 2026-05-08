import type { PipelineConfig, PipelineContext, PipelineResult, StageConfig } from './types.js'
import { DEFAULT_PIPELINE_CONFIG } from './types.js'
import { PipelineStage } from './pipeline-stage.js'

export { PipelineStage } from './pipeline-stage.js'
export type { PipelineContext, PipelineError, StageConfig, StageHandler, RollbackHandler, PipelineConfig, PipelineResult } from './types.js'
export { DEFAULT_PIPELINE_CONFIG } from './types.js'

export class PipelineEngine {
  private config: PipelineConfig
  private stages: PipelineStage[]

  constructor(config?: Partial<PipelineConfig>) {
    this.config = { ...DEFAULT_PIPELINE_CONFIG, ...config }
    this.stages = this.config.stages.map((s) => new PipelineStage(s))
  }

  async run(initialData?: Record<string, unknown>): Promise<PipelineResult> {
    const startTime = Date.now()

    const ctx: PipelineContext = {
      data: initialData ? { ...initialData } : {},
      metadata: new Map<string, unknown>(),
      errors: [],
      aborted: false,
    }

    const completedStages: string[] = []
    let failedStage: string | undefined

    for (const stage of this.stages) {
      if (ctx.aborted) break

      try {
        const result = await stage.execute(ctx)
        ctx.data = result.data
        ctx.metadata = result.metadata
        ctx.aborted = result.aborted
        completedStages.push(stage.getName())
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        ctx.errors.push({
          stage: stage.getName(),
          message,
          recoverable: this.config.continueOnError,
        })
        failedStage = stage.getName()

        if (!this.config.continueOnError) {
          ctx.aborted = true
          break
        }
      }
    }

    if (failedStage && !this.config.continueOnError) {
      for (let i = completedStages.length - 1; i >= 0; i--) {
        const stageName = completedStages[i]!
        const stage = this.getStage(stageName)
        if (stage) {
          await stage.rollback(ctx)
        }
      }
    }

    const duration = Date.now() - startTime

    return {
      success: ctx.errors.length === 0 && !failedStage,
      context: ctx,
      completedStages,
      failedStage,
      duration,
    }
  }

  addStage(config: StageConfig): void {
    this.stages.push(new PipelineStage(config))
  }

  removeStage(name: string): boolean {
    const index = this.stages.findIndex((s) => s.getName() === name)
    if (index === -1) return false
    this.stages.splice(index, 1)
    return true
  }

  insertStage(config: StageConfig, after?: string): void {
    const newStage = new PipelineStage(config)
    if (after === undefined) {
      this.stages.unshift(newStage)
      return
    }
    const index = this.stages.findIndex((s) => s.getName() === after)
    if (index === -1) {
      this.stages.unshift(newStage)
      return
    }
    this.stages.splice(index + 1, 0, newStage)
  }

  getStages(): string[] {
    return this.stages.map((s) => s.getName())
  }

  getStage(name: string): PipelineStage | undefined {
    return this.stages.find((s) => s.getName() === name)
  }

  validate(): string[] {
    const issues: string[] = []
    const names = this.stages.map((s) => s.getName())
    const seen = new Set<string>()

    for (const name of names) {
      if (seen.has(name)) {
        issues.push(`Duplicate stage name: "${name}"`)
      }
      seen.add(name)
    }

    return issues
  }
}
