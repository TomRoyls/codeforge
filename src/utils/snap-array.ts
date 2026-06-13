export class SnapArray<T> {
  private snapshots: T[][] = [[]]
  private currentVersion = 0

  push(item: T): void {
    this.ensureCurrentVersion()
    this.snapshots[this.currentVersion]!.push(item)
  }

  pop(): T | undefined {
    this.ensureCurrentVersion()
    return this.snapshots[this.currentVersion]!.pop()
  }

  get(index: number): T | undefined {
    return this.snapshots[this.currentVersion]?.[index]
  }

  set(index: number, value: T): void {
    this.ensureCurrentVersion()
    const arr = this.snapshots[this.currentVersion]!
    if (index >= 0 && index < arr.length) arr[index] = value
  }

  snapshot(): number {
    const prevVersion = this.currentVersion
    this.currentVersion++
    this.snapshots[this.currentVersion] = [...this.snapshots[this.currentVersion - 1]!]
    return prevVersion
  }

  restore(version: number): boolean {
    if (version < 0 || version >= this.snapshots.length) return false
    this.currentVersion = version
    return true
  }

  get length(): number { return this.snapshots[this.currentVersion]?.length ?? 0 }
  get version(): number { return this.currentVersion }
  get snapshotCount(): number { return this.snapshots.length }
  get isEmpty(): boolean { return this.length === 0 }

  private ensureCurrentVersion(): void {
    if (!this.snapshots[this.currentVersion]) {
      this.snapshots[this.currentVersion] = [...(this.snapshots[this.currentVersion - 1] ?? [])]
    }
  }

  clear(): void { this.snapshots = [[]]; this.currentVersion = 0 }

  toArray(): T[] { return [...(this.snapshots[this.currentVersion] ?? [])] }
  toString(): string { return JSON.stringify({ version: this.currentVersion, length: this.length }) }
  toJSON(): Record<string, number> { return { version: this.currentVersion, length: this.length, snapshots: this.snapshots.length } }

  clone(): SnapArray<T> {
    const c = new SnapArray<T>()
    c.snapshots = this.snapshots.map((s) => [...s])
    c.currentVersion = this.currentVersion
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SnapArray)) return false
    return this.length === other.length
  }
}
