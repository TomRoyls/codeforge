export interface RangeEntry<V> {
  start: number;
  end: number;
  value: V;
}

export class RangeMap2<V> {
  private _ranges: RangeEntry<V>[] = [];

  get size(): number {
    return this._ranges.length;
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  clear(): void {
    this._ranges = [];
  }

  set(start: number, end: number, value: V): void {
    if (start >= end) return;

    const toRemove: number[] = [];
    const toAdd: RangeEntry<V>[] = [];

    for (let i = 0; i < this._ranges.length; i++) {
      const existing = this._ranges[i]!;
      if (existing.end <= start || existing.start >= end) continue;

      if (existing.value === value) {
        if (existing.start < start && existing.end > end) {
          toRemove.push(i);
          toAdd.push({ start: existing.start, end: start, value });
          toAdd.push({ start: end, end: existing.end, value });
        } else if (existing.start < start) {
          toRemove.push(i);
          toAdd.push({ start: existing.start, end: start, value });
          start = existing.start;
        } else if (existing.end > end) {
          toRemove.push(i);
          toAdd.push({ start: end, end: existing.end, value });
          end = existing.end;
        } else {
          toRemove.push(i);
        }
      } else {
        if (existing.start < start && existing.end > end) {
          toRemove.push(i);
          toAdd.push({ start: existing.start, end: start, value: existing.value });
          toAdd.push({ start: end, end: existing.end, value: existing.value });
        } else if (existing.start < start) {
          toRemove.push(i);
          toAdd.push({ start: existing.start, end: start, value: existing.value });
        } else if (existing.end > end) {
          toRemove.push(i);
          toAdd.push({ start: end, end: existing.end, value: existing.value });
        } else {
          toRemove.push(i);
        }
      }
    }

    for (const idx of toRemove.sort((a, b) => b - a)) {
      this._ranges.splice(idx, 1);
    }

    for (const entry of toAdd) {
      this._ranges.push(entry);
    }

    this._ranges.push({ start, end, value });
    this._ranges.sort((a, b) => a.start - b.start);
    this._mergeAdjacent();
  }

  get(point: number): V | undefined {
    for (const entry of this._ranges) {
      if (point >= entry.start && point < entry.end) {
        return entry.value;
      }
    }
    return undefined;
  }

  getRange(start: number, end: number): Array<{ start: number; end: number; value: V }> {
    const result: Array<{ start: number; end: number; value: V }> = [];
    for (const entry of this._ranges) {
      if (entry.end <= start || entry.start >= end) continue;
      result.push({
        start: Math.max(entry.start, start),
        end: Math.min(entry.end, end),
        value: entry.value,
      });
    }
    return result;
  }

  delete(start: number, end: number): void {
    if (start >= end) return;

    const toRemove: number[] = [];
    const toAdd: RangeEntry<V>[] = [];

    for (let i = 0; i < this._ranges.length; i++) {
      const existing = this._ranges[i]!;
      if (existing.end <= start || existing.start >= end) continue;

      if (existing.start < start && existing.end > end) {
        toRemove.push(i);
        toAdd.push({ start: existing.start, end: start, value: existing.value });
        toAdd.push({ start: end, end: existing.end, value: existing.value });
      } else if (existing.start < start) {
        toRemove.push(i);
        toAdd.push({ start: existing.start, end: start, value: existing.value });
      } else if (existing.end > end) {
        toRemove.push(i);
        toAdd.push({ start: end, end: existing.end, value: existing.value });
      } else {
        toRemove.push(i);
      }
    }

    for (const idx of toRemove.sort((a, b) => b - a)) {
      this._ranges.splice(idx, 1);
    }

    for (const entry of toAdd) {
      this._ranges.push(entry);
    }

    this._ranges.sort((a, b) => a.start - b.start);
  }

  ranges(): Array<{ start: number; end: number; value: V }> {
    return this._ranges.map((r) => ({ start: r.start, end: r.end, value: r.value }));
  }

  private _mergeAdjacent(): void {
    if (this._ranges.length < 2) return;

    const merged: RangeEntry<V>[] = [this._ranges[0]!];

    for (let i = 1; i < this._ranges.length; i++) {
      const current = this._ranges[i]!;
      const last = merged[merged.length - 1]!;
      if (last.end === current.start && last.value === current.value) {
        last.end = current.end;
      } else {
        merged.push(current);
      }
    }

    this._ranges = merged;
  }

  toString(): string {
    return `RangeMap2({ size: ${this.size} })`
  }
}
