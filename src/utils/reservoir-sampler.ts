export class ReservoirSampler<T> {
  private reservoir: T[]
  private _size: number = 0

  constructor(private capacity: number) {
    this.reservoir = []
  }

  add(item: T): void {
    this._size++
    if (this.reservoir.length < this.capacity) {
      this.reservoir.push(item)
    } else {
      const idx = Math.floor(Math.random() * this._size)
      if (idx < this.capacity) {
        this.reservoir[idx] = item
      }
    }
  }

  get sample(): T[] {
    return [...this.reservoir]
  }

  get totalSeen(): number {
    return this._size
  }

  get isFull(): boolean {
    return this.reservoir.length >= this.capacity
  }

  reset(): void {
    this.reservoir = []
    this._size = 0
  }
}
