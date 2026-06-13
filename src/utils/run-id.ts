export class RunId {
  private static counter = 0
  private id: number

  constructor() {
    this.id = ++RunId.counter
  }

  get value(): number { return this.id }

  static reset(): void { RunId.counter = 0 }

  static get next(): number { return ++RunId.counter }

  compareTo(other: RunId): number { return this.id - other.id }

  get name(): string { return 'RunId' }
  toString(): string { return `RunId(${this.id})` }
  toJSON(): Record<string, number> { return { id: this.id } }

  clone(): RunId {
    return new RunId()
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RunId)) return false
    return this.id === other.id
  }

  toArray(): number[] { return [this.id] }
}
