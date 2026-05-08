export interface PipelineContext {
  data: Record<string, unknown>
  metadata: Map<string, unknown>
  errors: PipelineError[]
  aborted: boolean
}

export interface PipelineError {
  stage: string
  message: string
  recoverable: boolean
}

export interface StageConfig {
  name: string
  handler: StageHandler
  rollback?: RollbackHandler
  timeout?: number
  retries?: number
}

export type StageHandler = (ctx: PipelineContext) => Promise<PipelineContext> | PipelineContext

export type RollbackHandler = (ctx: PipelineContext) => Promise<void> | void

export interface PipelineConfig {
  name: string
  stages: StageConfig[]
  continueOnError: boolean
  maxConcurrency: number
}

export interface PipelineResult {
  success: boolean
  context: PipelineContext
  completedStages: string[]
  failedStage?: string
  duration: number
}

export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  name: 'default-pipeline',
  stages: [],
  continueOnError: false,
  maxConcurrency: 1,
}
