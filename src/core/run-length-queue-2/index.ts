export class RunLengthQueue2<T> {
  private runs: { value: T; count: number }[];
  private _frontIdx: number = 0;

  constructor() {
    this.runs = [];
  }

  enqueue(value: T): void {
    const lastIdx = this.runs.length - 1
    if (lastIdx >= this._frontIdx && this.runs[lastIdx]!.value === value) {
      this.runs[lastIdx]!.count++;
    } else {
      this.runs.push({ value, count: 1 });
    }
  }

  dequeue(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    
    const run = this.runs[this._frontIdx]!;
    run.count--;
    
    if (run.count === 0) {
      this._frontIdx++;
      if (this._frontIdx > this.runs.length / 2) {
        this.runs = this.runs.slice(this._frontIdx)
        this._frontIdx = 0
      }
    }
    
    return run.value;
  }

  get peek(): T | undefined {
    return this.isEmpty ? undefined : this.runs[this._frontIdx]!.value;
  }

  get size(): number {
    let total = 0
    for (let i = this._frontIdx; i < this.runs.length; i++) {
      total += this.runs[i]!.count
    }
    return total;
  }

  get isEmpty(): boolean {
    if (this._frontIdx >= this.runs.length) return true
    for (let i = this._frontIdx; i < this.runs.length; i++) {
      if (this.runs[i]!.count > 0) return false
    }
    return true
  }

  clear(): void {
    this.runs = [];
    this._frontIdx = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = this._frontIdx; i < this.runs.length; i++) {
      const run = this.runs[i]!
      for (let j = 0; j < run.count; j++) {
        result.push(run.value);
      }
    }
    return result;
  }

  enqueueRun(value: T, count: number): void {
    if (count <= 0) {
      return;
    }
    const lastIdx = this.runs.length - 1
    if (lastIdx >= this._frontIdx && this.runs[lastIdx]!.value === value) {
      this.runs[lastIdx]!.count += count;
    } else {
      this.runs.push({ value, count });
    }
  }

  dequeueRun(): { value: T; count: number } | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    const run = this.runs[this._frontIdx]!;
    this._frontIdx++
    if (this._frontIdx > this.runs.length / 2) {
      this.runs = this.runs.slice(this._frontIdx)
      this._frontIdx = 0
    }
    return { value: run.value, count: run.count };
  }

  get uniqueValues(): T[] {
    const result: T[] = []
    for (let i = this._frontIdx; i < this.runs.length; i++) {
      result.push(this.runs[i]!.value)
    }
    return result;
  }

  get totalRuns(): number {
    return this.runs.length - this._frontIdx;
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }
}
