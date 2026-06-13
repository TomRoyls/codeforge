export type PipelineStage<T, R> = (input: T) => R

export class Pipeline2<T> {
  private stages: PipelineStage<unknown, unknown>[] = []
  private initialValue: T | undefined

  constructor(initial?: T) {
    this.initialValue = initial
  }

  addStage<R>(fn: PipelineStage<T, R>): Pipeline2<R> {
    const p = new Pipeline2<R>(this.initialValue as unknown as R)
    p.stages = [...this.stages, fn as unknown as PipelineStage<unknown, unknown>]
    return p
  }

  run<R>(input?: T): R {
    let result: unknown = input ?? this.initialValue
    for (const stage of this.stages) {
      result = stage(result)
    }
    return result as R
  }

  compose<R>(other: Pipeline2<R>): Pipeline2<R> {
    const p = new Pipeline2<R>()
    p.stages = [...this.stages, ...other.stages]
    return p
  }

  get size(): number { return this.stages.length }
  clear(): void { this.stages = [] }

  toArray(): PipelineStage<unknown, unknown>[] { return [...this.stages] }
  toString(): string { return JSON.stringify({ stages: this.stages.length }) }
  toJSON(): Record<string, number> { return { stages: this.stages.length } }
  clone(): Pipeline2<T> {
    const c = new Pipeline2<T>(this.initialValue)
    c.stages = [...this.stages]
    return c
  }
  equals(other: unknown): boolean { return other instanceof Pipeline2 }
}
