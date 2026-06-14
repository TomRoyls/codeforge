export type PipelineStageType2 = 'extract' | 'transform' | 'load' | 'validate' | 'enrich'
export type PipelineState2 = 'idle' | 'running' | 'paused' | 'completed' | 'failed'

export interface PipelineStage2 {
  id: string
  name: string
  type: PipelineStageType2
  state: PipelineState2
  inputCount: number
  outputCount: number
  rejectedCount: number
  startTime: number | null
  endTime: number | null
  duration: number | null
  error: string | null
  config: Record<string, unknown>
}

export interface PipelineRun2 {
  id: string
  pipelineId: string
  state: PipelineState2
  stages: PipelineStage2[]
  startTime: number | null
  endTime: number | null
  totalDuration: number | null
  recordsIn: number
  recordsOut: number
  error: string | null
}

export interface Pipeline2 {
  id: string
  name: string
  description: string
  stages: PipelineStage2[]
  state: PipelineState2
  schedule: string | null
  lastRunId: string | null
  runs: PipelineRun2[]
  maxRuns: number
  createdAt: number
  metadata: Record<string, unknown>
}

export class EtlProcessor2 {
  private pipelines: Map<string, Pipeline2> = new Map()
  private listeners: Array<(event: string, data: unknown) => void> = []
  private idCounter = 0
  private stageCounter = 0
  private runCounter = 0

  create(name: string, description: string): string {
    const id = `pipe_${++this.idCounter}`
    const pipeline: Pipeline2 = {
      id, name, description,
      stages: [],
      state: 'idle',
      schedule: null,
      lastRunId: null,
      runs: [],
      maxRuns: 50,
      createdAt: Date.now(),
      metadata: {},
    }
    this.pipelines.set(id, pipeline)
    this.notify('pipeline-created', { id })
    return id
  }

  addStage(pipelineId: string, name: string, type: PipelineStageType2, config: Record<string, unknown> = {}): string {
    const pipe = this.pipelines.get(pipelineId)
    if (!pipe) return ''
    const stageId = `stage_${++this.stageCounter}`
    const stage: PipelineStage2 = {
      id: stageId, name, type,
      state: 'idle',
      inputCount: 0, outputCount: 0, rejectedCount: 0,
      startTime: null, endTime: null, duration: null,
      error: null, config,
    }
    pipe.stages.push(stage)
    this.notify('stage-added', { pipelineId, stageId })
    return stageId
  }

  setSchedule(pipelineId: string, schedule: string): boolean {
    const pipe = this.pipelines.get(pipelineId)
    if (!pipe) return false
    pipe.schedule = schedule
    return true
  }

  setMetadata(pipelineId: string, key: string, value: unknown): boolean {
    const pipe = this.pipelines.get(pipelineId)
    if (!pipe) return false
    pipe.metadata[key] = value
    return true
  }

  run(pipelineId: string, inputCount: number = 1000): string | null {
    const pipe = this.pipelines.get(pipelineId)
    if (!pipe || pipe.state === 'running') return null

    const runId = `run_${++this.runCounter}`
    const now = Date.now()
    const stagesCopy: PipelineStage2[] = pipe.stages.map(s => ({
      ...s,
      state: 'idle',
      inputCount: 0, outputCount: 0, rejectedCount: 0,
      startTime: null, endTime: null, duration: null,
      error: null,
    }))

    const run: PipelineRun2 = {
      id: runId, pipelineId,
      state: 'running',
      stages: stagesCopy,
      startTime: now,
      endTime: null,
      totalDuration: null,
      recordsIn: inputCount,
      recordsOut: 0,
      error: null,
    }

    pipe.state = 'running'
    pipe.lastRunId = runId
    this.notify('run-started', { pipelineId, runId })

    let currentCount = inputCount
    let failed = false
    for (const stage of run.stages) {
      stage.state = 'running'
      stage.startTime = Date.now()
      stage.inputCount = currentCount
      stage.outputCount = Math.floor(currentCount * 0.95)
      stage.rejectedCount = currentCount - stage.outputCount
      stage.endTime = Date.now()
      stage.duration = stage.endTime - stage.startTime
      stage.state = 'completed'
      currentCount = stage.outputCount
    }

    run.recordsOut = currentCount
    run.endTime = Date.now()
    run.totalDuration = run.endTime - run.startTime

    if (!failed) {
      run.state = 'completed'
      pipe.state = 'completed'
      this.notify('run-completed', { pipelineId, runId })
    } else {
      run.state = 'failed'
      pipe.state = 'failed'
      this.notify('run-failed', { pipelineId, runId })
    }

    pipe.runs.push(run)
    if (pipe.runs.length > pipe.maxRuns) pipe.runs.shift()

    return runId
  }

  pause(pipelineId: string): boolean {
    const pipe = this.pipelines.get(pipelineId)
    if (!pipe || pipe.state !== 'running') return false
    pipe.state = 'paused'
    this.notify('pipeline-paused', { pipelineId })
    return true
  }

  resume(pipelineId: string): boolean {
    const pipe = this.pipelines.get(pipelineId)
    if (!pipe || pipe.state !== 'paused') return false
    pipe.state = 'running'
    this.notify('pipeline-resumed', { pipelineId })
    return true
  }

  getPipeline(id: string): Pipeline2 | undefined { return this.pipelines.get(id) }
  getRun(pipelineId: string, runId: string): PipelineRun2 | undefined {
    const pipe = this.pipelines.get(pipelineId)
    if (!pipe) return undefined
    return pipe.runs.find(r => r.id === runId)
  }
  getByName(name: string): Pipeline2 | undefined { return Array.from(this.pipelines.values()).find(p => p.name === name) }
  getByState(state: PipelineState2): Pipeline2[] { return Array.from(this.pipelines.values()).filter(p => p.state === state) }

  getStage(pipelineId: string, stageId: string): PipelineStage2 | undefined {
    const pipe = this.pipelines.get(pipelineId)
    if (!pipe) return undefined
    return pipe.stages.find(s => s.id === stageId)
  }

  getLastRun(pipelineId: string): PipelineRun2 | null {
    const pipe = this.pipelines.get(pipelineId)
    if (!pipe || !pipe.lastRunId) return null
    return pipe.runs.find(r => r.id === pipe.lastRunId) || null
  }

  getRunHistory(pipelineId: string): PipelineRun2[] {
    const pipe = this.pipelines.get(pipelineId)
    if (!pipe) return []
    return [...pipe.runs].reverse()
  }

  getThroughput(pipelineId: string): number {
    const lastRun = this.getLastRun(pipelineId)
    if (!lastRun || !lastRun.totalDuration) return 0
    return lastRun.recordsOut / (lastRun.totalDuration / 1000)
  }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { pipelines: number; running: number; completed: number; failed: number; totalRuns: number } {
    return {
      pipelines: this.pipelines.size,
      running: this.getByState('running').length,
      completed: this.getByState('completed').length,
      failed: this.getByState('failed').length,
      totalRuns: Array.from(this.pipelines.values()).reduce((s, p) => s + p.runs.length, 0),
    }
  }

  count(): number { return this.pipelines.size }

  toArray(): Pipeline2[] { return Array.from(this.pipelines.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): EtlProcessor2 {
    const ep = new EtlProcessor2()
    ep.idCounter = this.idCounter
    ep.stageCounter = this.stageCounter
    ep.runCounter = this.runCounter
    return ep
  }
  equals(other: unknown): boolean {
    if (!(other instanceof EtlProcessor2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.pipelines.clear()
    this.listeners = []
    this.idCounter = 0
    this.stageCounter = 0
    this.runCounter = 0
  }
}
