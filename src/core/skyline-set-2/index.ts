export class SkylineSet2<T> {
  private dimensionCount: number;
  private _items: Array<{item: T, scores: number[]}>;

  constructor(dimensionCount: number) {
    this.dimensionCount = dimensionCount;
    this._items = [];
  }

  add(item: T, scores: number[]): boolean {
    if (scores.length !== this.dimensionCount) {
      return false;
    }

    for (const existing of this._items) {
      if (this.dominates(existing.scores, scores)) {
        return false;
      }
    }

    const dominatedIndices: number[] = [];
    for (let i = 0; i < this._items.length; i++) {
      if (this.dominates(scores, this._items[i]!.scores)) {
        dominatedIndices.push(i);
      }
    }

    for (let i = dominatedIndices.length - 1; i >= 0; i--) {
      this._items.splice(dominatedIndices[i]!, 1);
    }

    this._items.push({item, scores});
    return true;
  }

  has(item: T): boolean {
    for (const entry of this._items) {
      if (entry.item === item) {
        return true;
      }
    }
    return false;
  }

  remove(item: T): boolean {
    for (let i = 0; i < this._items.length; i++) {
      if (this._items[i]!.item === item) {
        this._items.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  size(): number {
    return this._items.length;
  }

  clear(): void {
    this._items = [];
  }

  items(): Array<{item: T, scores: number[]}> {
    return [...this._items];
  }

  dominates(scores1: number[], scores2: number[]): boolean {
    if (scores1.length !== scores2.length) {
      return false;
    }

    let atLeastOneStrictlyGreater = false;
    for (let i = 0; i < scores1.length; i++) {
      if (scores1[i]! < scores2[i]!) {
        return false;
      }
      if (scores1[i]! > scores2[i]!) {
        atLeastOneStrictlyGreater = true;
      }
    }
    return atLeastOneStrictlyGreater;
  }
}
