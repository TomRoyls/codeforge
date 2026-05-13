interface Segment<V> {
  start: number;
  end: number;
  value: V;
  left: Segment<V> | null;
  right: Segment<V> | null;
}

export class SegmentMap2<V> {
  private root: Segment<V> | null = null;
  private _size: number = 0;

  set(start: number, end: number, value: V): void {
    if (start >= end) {
      return;
    }

    const hasOverlap = this.checkOverlap(this.root, start, end);

    if (hasOverlap) {
      this.root = this.setRange(this.root, start, end, value);
    } else {
      this.root = this.insert(this.root, start, end, value);
      this._size++;
    }
  }

  get(point: number): V | undefined {
    return this.findPoint(this.root, point);
  }

  getRange(start: number, end: number): Array<{start: number; end: number; value: V}> {
    const result: Array<{start: number; end: number; value: V}> = [];
    this.collectInRange(this.root, start, end, result);
    return result;
  }

  delete(start: number, end: number): void {
    this.root = this.deleteRange(this.root, start, end);
  }

  get size(): number {
    return this._size;
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  private setRange(node: Segment<V> | null, start: number, end: number, value: V): Segment<V> | null {
    if (!node) {
      this._size = 1;
      return { start, end, value, left: null, right: null };
    }

    if (node.end <= start) {
      node.right = this.setRange(node.right, start, end, value);
      return node;
    }

    if (node.start >= end) {
      node.left = this.setRange(node.left, start, end, value);
      return node;
    }

    const result: Segment<V>[] = [];
    const before: Segment<V>[] = [];
    const after: Segment<V>[] = [];

    this.splitAndReplace(node, start, end, value, before, result, after);

    let newRoot: Segment<V> | null = null;

    for (const seg of before) {
      newRoot = this.insert(newRoot, seg.start, seg.end, seg.value);
    }

    newRoot = this.insert(newRoot, start, end, value);

    for (const seg of after) {
      newRoot = this.insert(newRoot, seg.start, seg.end, seg.value);
    }

    this._size = this.countSegments(newRoot);
    return newRoot;
  }

  private deleteRange(node: Segment<V> | null, start: number, end: number): Segment<V> | null {
    if (!node) {
      return null;
    }

    if (node.end <= start) {
      node.right = this.deleteRange(node.right, start, end);
      return node;
    }

    if (node.start >= end) {
      node.left = this.deleteRange(node.left, start, end);
      return node;
    }

    const result: Segment<V>[] = [];
    const remaining: Segment<V>[] = [];

    this.collectNonOverlapping(node, start, end, remaining);

    let newRoot: Segment<V> | null = null;

    for (const seg of remaining) {
      newRoot = this.insert(newRoot, seg.start, seg.end, seg.value);
    }

    this._size = this.countSegments(newRoot);
    return newRoot;
  }

  private splitAndReplace(node: Segment<V> | null, start: number, end: number, value: V, before: Segment<V>[], result: Segment<V>[], after: Segment<V>[]): void {
    if (!node) {
      return;
    }

    if (node.end <= start) {
      before.push(node);
      this.splitAndReplace(node.right, start, end, value, before, result, after);
      return;
    }

    if (node.start >= end) {
      after.push(node);
      this.splitAndReplace(node.left, start, end, value, before, result, after);
      return;
    }

    if (node.left) {
      this.splitAndReplace(node.left, start, end, value, before, result, after);
    }

    if (node.start < start) {
      before.push({ start: node.start, end: start, value: node.value, left: null, right: null });
    }

    result.push(node);

    if (node.end > end) {
      after.push({ start: end, end: node.end, value: node.value, left: null, right: null });
    }

    if (node.right) {
      this.splitAndReplace(node.right, start, end, value, before, result, after);
    }
  }

  private collectNonOverlapping(node: Segment<V> | null, start: number, end: number, remaining: Segment<V>[]): void {
    if (!node) {
      return;
    }

    if (node.end <= start) {
      remaining.push(node);
      this.collectNonOverlapping(node.right, start, end, remaining);
      return;
    }

    if (node.start >= end) {
      remaining.push(node);
      this.collectNonOverlapping(node.left, start, end, remaining);
      return;
    }

    if (node.left) {
      this.collectNonOverlapping(node.left, start, end, remaining);
    }

    if (node.start < start) {
      remaining.push({ start: node.start, end: start, value: node.value, left: null, right: null });
    }

    if (node.end > end) {
      remaining.push({ start: end, end: node.end, value: node.value, left: null, right: null });
    }

    if (node.right) {
      this.collectNonOverlapping(node.right, start, end, remaining);
    }
  }

  private insert(node: Segment<V> | null, start: number, end: number, value: V): Segment<V> {
    if (!node) {
      return { start, end, value, left: null, right: null };
    }

    if (start < node.start) {
      node.left = this.insert(node.left, start, end, value);
    } else {
      node.right = this.insert(node.right, start, end, value);
    }

    return node;
  }

  private checkOverlap(node: Segment<V> | null, start: number, end: number): boolean {
    if (!node) {
      return false;
    }

    if (node.start < end && node.end > start) {
      return true;
    }

    if (start < node.start) {
      return this.checkOverlap(node.left, start, end);
    }

    return this.checkOverlap(node.right, start, end);
  }

  private findPoint(node: Segment<V> | null, point: number): V | undefined {
    if (!node) {
      return undefined;
    }

    if (node.start <= point && point < node.end) {
      return node.value;
    }

    if (point < node.start) {
      return this.findPoint(node.left, point);
    }

    return this.findPoint(node.right, point);
  }

  private collectInRange(node: Segment<V> | null, start: number, end: number, result: Array<{start: number; end: number; value: V}>): void {
    if (!node) {
      return;
    }

    if (node.end <= start) {
      this.collectInRange(node.right, start, end, result);
      return;
    }

    if (node.start >= end) {
      this.collectInRange(node.left, start, end, result);
      return;
    }

    if (node.left) {
      this.collectInRange(node.left, start, end, result);
    }

    if (node.start < end && node.end > start) {
      result.push({ start: node.start, end: node.end, value: node.value });
    }

    if (node.right) {
      this.collectInRange(node.right, start, end, result);
    }
  }

  private countSegments(node: Segment<V> | null): number {
    if (!node) {
      return 0;
    }

    return 1 + this.countSegments(node.left) + this.countSegments(node.right);
  }
}
