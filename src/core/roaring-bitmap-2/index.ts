export class RoaringBitmap2 {
  private runs: [number, number][] = [];

  add(value: number): void {
    if (value < 0) return;

    let left = 0;
    let right = this.runs.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const [start, end] = this.runs[mid]!;

      if (value < start - 1) {
        right = mid - 1;
      } else if (value > end + 1) {
        left = mid + 1;
      } else {
        this.runs[mid]![0] = Math.min(start, value);
        this.runs[mid]![1] = Math.max(end, value);
        this.mergeAdjacent(mid);
        return;
      }
    }

    this.runs.splice(left, 0, [value, value]);
  }

  has(value: number): boolean {
    if (value < 0) return false;

    let left = 0;
    let right = this.runs.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const [start, end] = this.runs[mid]!;

      if (value < start) {
        right = mid - 1;
      } else if (value > end) {
        left = mid + 1;
      } else {
        return true;
      }
    }

    return false;
  }

  remove(value: number): void {
    if (value < 0) return;

    let left = 0;
    let right = this.runs.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const [start, end] = this.runs[mid]!;

      if (value < start) {
        right = mid - 1;
      } else if (value > end) {
        left = mid + 1;
      } else {
        if (start === value && end === value) {
          this.runs.splice(mid, 1);
        } else if (start === value) {
          this.runs[mid]![0] = value + 1;
        } else if (end === value) {
          this.runs[mid]![1] = value - 1;
        } else {
          this.runs.splice(mid, 1, [start, value - 1], [value + 1, end]);
        }
        return;
      }
    }
  }

  get size(): number {
    let total = 0;
    for (let i = 0; i < this.runs.length; i++) {
      const [start, end] = this.runs[i]!;
      total += end - start + 1;
    }
    return total;
  }

  isEmpty(): boolean {
    return this.runs.length === 0;
  }

  and(other: RoaringBitmap2): RoaringBitmap2 {
    const result = new RoaringBitmap2();
    let i = 0;
    let j = 0;

    while (i < this.runs.length && j < other.runs.length) {
      const [aStart, aEnd] = this.runs[i]!;
      const [bStart, bEnd] = other.runs[j]!;

      if (aEnd < bStart) {
        i++;
      } else if (bEnd < aStart) {
        j++;
      } else {
        const start = Math.max(aStart, bStart);
        const end = Math.min(aEnd, bEnd);
        if (result.isEmpty() || result.runs[result.runs.length - 1]![1]! < start - 1) {
          result.runs.push([start, end]);
        } else {
          result.runs[result.runs.length - 1]![1] = end;
        }

        if (aEnd < bEnd) {
          i++;
        } else {
          j++;
        }
      }
    }

    return result;
  }

  or(other: RoaringBitmap2): RoaringBitmap2 {
    const result = new RoaringBitmap2();
    let i = 0;
    let j = 0;

    while (i < this.runs.length || j < other.runs.length) {
      if (j >= other.runs.length || (i < this.runs.length && this.runs[i]![0]! < other.runs[j]![0]!)) {
        result.addRun(this.runs[i]![0]!, this.runs[i]![1]!);
        i++;
      } else {
        result.addRun(other.runs[j]![0]!, other.runs[j]![1]!);
        j++;
      }
    }

    return result;
  }

  xor(other: RoaringBitmap2): RoaringBitmap2 {
    const result = new RoaringBitmap2();
    let i = 0;
    let j = 0;
    let aOffset = 0;
    let bOffset = 0;

    while (i < this.runs.length || j < other.runs.length) {
      if (j >= other.runs.length) {
        const run = this.runs[i]!;
        if (aOffset > 0) {
          result.addRun(run[0]! + aOffset, run[1]!);
        } else {
          result.addRun(run[0]!, run[1]!);
        }
        aOffset = 0;
        i++;
      } else if (i >= this.runs.length) {
        const run = other.runs[j]!;
        if (bOffset > 0) {
          result.addRun(run[0]! + bOffset, run[1]!);
        } else {
          result.addRun(run[0]!, run[1]!);
        }
        bOffset = 0;
        j++;
      } else {
        const aRun = this.runs[i]!;
        const bRun = other.runs[j]!;
        const aStart = aRun[0]! + aOffset;
        const aEnd = aRun[1]!;
        const bStart = bRun[0]! + bOffset;
        const bEnd = bRun[1]!;

        if (aEnd < bStart) {
          result.addRun(aStart, aEnd);
          aOffset = 0;
          i++;
        } else if (bEnd < aStart) {
          result.addRun(bStart, bEnd);
          bOffset = 0;
          j++;
        } else {
          const overlapStart = Math.max(aStart, bStart);
          const overlapEnd = Math.min(aEnd, bEnd);

          if (aStart < overlapStart) {
            result.addRun(aStart, overlapStart - 1);
          }
          if (bStart < overlapStart) {
            result.addRun(bStart, overlapStart - 1);
          }

          if (aEnd > overlapEnd) {
            aOffset = overlapEnd + 1 - aRun[0]!;
          } else {
            aOffset = 0;
            i++;
          }

          if (bEnd > overlapEnd) {
            bOffset = overlapEnd + 1 - bRun[0]!;
          } else {
            bOffset = 0;
            j++;
          }
        }
      }
    }

    return result;
  }

  clear(): void {
    this.runs = [];
  }

  private addRun(start: number, end: number): void {
    if (this.isEmpty()) {
      this.runs.push([start, end]);
      return;
    }

    const lastRun = this.runs[this.runs.length - 1]!;
    if (lastRun[1]! >= start - 1) {
      this.runs[this.runs.length - 1]![1] = Math.max(lastRun[1]!, end);
    } else {
      this.runs.push([start, end]);
    }
  }

  private mergeAdjacent(index: number): void {
    while (index > 0 && this.runs[index - 1]![1]! >= this.runs[index]![0]! - 1) {
      this.runs[index - 1]![1] = Math.max(this.runs[index - 1]![1]!, this.runs[index]![1]!);
      this.runs.splice(index, 1);
      index--;
    }

    while (index < this.runs.length - 1 && this.runs[index]![1]! >= this.runs[index + 1]![0]! - 1) {
      this.runs[index]![1] = Math.max(this.runs[index]![1]!, this.runs[index + 1]![1]!);
      this.runs.splice(index + 1, 1);
    }
  }

  toString(): string {
    return `RoaringBitmap2({ size: ${this.size} })`
  }
}
