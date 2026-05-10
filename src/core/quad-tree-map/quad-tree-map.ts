import type {
  QuadTreeMapOptions,
  QuadTreeEntry,
  QuadTreeMapStatistics,
} from "./types.js";
import { DEFAULT_QUAD_TREE_MAP_OPTIONS } from "./types.js";

interface QuadTreeNode<V> {
  x: number;
  y: number;
  width: number;
  height: number;
  entries: Array<QuadTreeEntry<V>>;
  nw: QuadTreeNode<V> | null;
  ne: QuadTreeNode<V> | null;
  sw: QuadTreeNode<V> | null;
  se: QuadTreeNode<V> | null;
  depth: number;
}

function createNode<V>(
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number,
): QuadTreeNode<V> {
  return {
    x,
    y,
    width,
    height,
    entries: [],
    nw: null,
    ne: null,
    sw: null,
    se: null,
    depth,
  };
}

function containsPoint<V>(
  node: QuadTreeNode<V>,
  px: number,
  py: number,
): boolean {
  return (
    px >= node.x &&
    px < node.x + node.width &&
    py >= node.y &&
    py < node.y + node.height
  );
}

function intersects<V>(
  node: QuadTreeNode<V>,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): boolean {
  return (
    node.x < rx + rw &&
    node.x + node.width > rx &&
    node.y < ry + rh &&
    node.y + node.height > ry
  );
}

export class QuadTreeMap<V> {
  private root: QuadTreeNode<V>;
  private _capacity: number;
  private _maxDepth: number;
  private _size = 0;
  private _inserts = 0;
  private _deletes = 0;
  private _queries = 0;
  private _subdivisions = 0;
  private _currentMaxDepth = 0;

  constructor(options?: QuadTreeMapOptions) {
    const opts = { ...DEFAULT_QUAD_TREE_MAP_OPTIONS, ...options };
    this._capacity = opts.capacity;
    this._maxDepth = opts.maxDepth;
    this.root = createNode<V>(
      opts.bounds.x,
      opts.bounds.y,
      opts.bounds.width,
      opts.bounds.height,
      0,
    );
  }

  private subdivide(node: QuadTreeNode<V>): void {
    const hw = node.width / 2;
    const hh = node.height / 2;
    node.nw = createNode<V>(node.x, node.y, hw, hh, node.depth + 1);
    node.ne = createNode<V>(node.x + hw, node.y, hw, hh, node.depth + 1);
    node.sw = createNode<V>(node.x, node.y + hh, hw, hh, node.depth + 1);
    node.se = createNode<V>(node.x + hw, node.y + hh, hw, hh, node.depth + 1);
    this._subdivisions++;

    const childDepth = node.depth + 1;
    if (childDepth > this._currentMaxDepth) {
      this._currentMaxDepth = childDepth;
    }

    const oldEntries = node.entries;
    node.entries = [];
    for (const entry of oldEntries) {
      this.insertIntoNode(node, entry.x, entry.y, entry.value, true);
    }
  }

  private insertIntoNode(
    node: QuadTreeNode<V>,
    x: number,
    y: number,
    value: V,
    isRedistribute: boolean,
  ): void {
    if (node.nw !== null) {
      const child = this.getChild(node, x, y);
      if (child !== null) {
        this.insertIntoNode(child, x, y, value, isRedistribute);
      }
      return;
    }

    if (node.entries.length < this._capacity || node.depth >= this._maxDepth) {
      node.entries.push({ x, y, value });
      if (!isRedistribute) {
        this._size++;
        this._inserts++;
      }
      return;
    }

    this.subdivide(node);
    const child = this.getChild(node, x, y);
    if (child !== null) {
      this.insertIntoNode(child, x, y, value, isRedistribute);
    }
  }

  private getChild(
    node: QuadTreeNode<V>,
    x: number,
    y: number,
  ): QuadTreeNode<V> | null {
    const midX = node.x + node.width / 2;
    const midY = node.y + node.height / 2;
    if (x < midX && y < midY) return node.nw;
    if (x >= midX && y < midY) return node.ne;
    if (x < midX && y >= midY) return node.sw;
    if (x >= midX && y >= midY) return node.se;
    return null;
  }

  insert(x: number, y: number, value: V): void {
    this.insertIntoNode(this.root, x, y, value, false);
  }

  delete(x: number, y: number): boolean {
    const result = this.deleteFromNode(this.root, x, y);
    if (result) {
      this._size--;
      this._deletes++;
    }
    return result;
  }

  private deleteFromNode(
    node: QuadTreeNode<V>,
    x: number,
    y: number,
  ): boolean {
    if (!containsPoint(node, x, y)) {
      return false;
    }

    if (node.nw !== null) {
      const child = this.getChild(node, x, y);
      if (child !== null) {
        return this.deleteFromNode(child, x, y);
      }
      return false;
    }

    for (let i = 0; i < node.entries.length; i++) {
      const entry = node.entries[i]!;
      if (entry.x === x && entry.y === y) {
        node.entries.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  query(x: number, y: number): QuadTreeEntry<V> | undefined {
    this._queries++;
    return this.queryNode(this.root, x, y);
  }

  private queryNode(
    node: QuadTreeNode<V>,
    x: number,
    y: number,
  ): QuadTreeEntry<V> | undefined {
    if (!containsPoint(node, x, y)) {
      return undefined;
    }

    if (node.nw !== null) {
      const child = this.getChild(node, x, y);
      if (child !== null) {
        return this.queryNode(child, x, y);
      }
      return undefined;
    }

    for (const entry of node.entries) {
      if (entry.x === x && entry.y === y) {
        return entry;
      }
    }
    return undefined;
  }

  queryRange(
    x: number,
    y: number,
    width: number,
    height: number,
  ): QuadTreeEntry<V>[] {
    this._queries++;
    const result: QuadTreeEntry<V>[] = [];
    this.queryRangeNode(this.root, x, y, width, height, result);
    return result;
  }

  private queryRangeNode(
    node: QuadTreeNode<V>,
    rx: number,
    ry: number,
    rw: number,
    rh: number,
    result: QuadTreeEntry<V>[],
  ): void {
    if (!intersects(node, rx, ry, rw, rh)) {
      return;
    }

    if (node.nw !== null) {
      this.queryRangeNode(node.nw, rx, ry, rw, rh, result);
      this.queryRangeNode(node.ne!, rx, ry, rw, rh, result);
      this.queryRangeNode(node.sw!, rx, ry, rw, rh, result);
      this.queryRangeNode(node.se!, rx, ry, rw, rh, result);
      return;
    }

    for (const entry of node.entries) {
      if (
        entry.x >= rx &&
        entry.x < rx + rw &&
        entry.y >= ry &&
        entry.y < ry + rh
      ) {
        result.push(entry);
      }
    }
  }

  queryRadius(cx: number, cy: number, radius: number): QuadTreeEntry<V>[] {
    this._queries++;
    const result: QuadTreeEntry<V>[] = [];
    this.queryRadiusNode(this.root, cx, cy, radius, result);
    return result;
  }

  private queryRadiusNode(
    node: QuadTreeNode<V>,
    cx: number,
    cy: number,
    radius: number,
    result: QuadTreeEntry<V>[],
  ): void {
    if (!this.nodeIntersectsCircle(node, cx, cy, radius)) {
      return;
    }

    if (node.nw !== null) {
      this.queryRadiusNode(node.nw, cx, cy, radius, result);
      this.queryRadiusNode(node.ne!, cx, cy, radius, result);
      this.queryRadiusNode(node.sw!, cx, cy, radius, result);
      this.queryRadiusNode(node.se!, cx, cy, radius, result);
      return;
    }

    const r2 = radius * radius;
    for (const entry of node.entries) {
      const dx = entry.x - cx;
      const dy = entry.y - cy;
      if (dx * dx + dy * dy <= r2) {
        result.push(entry);
      }
    }
  }

  private nodeIntersectsCircle(
    node: QuadTreeNode<V>,
    cx: number,
    cy: number,
    radius: number,
  ): boolean {
    const closestX = Math.max(node.x, Math.min(cx, node.x + node.width));
    const closestY = Math.max(node.y, Math.min(cy, node.y + node.height));
    const dx = closestX - cx;
    const dy = closestY - cy;
    return dx * dx + dy * dy <= radius * radius;
  }

  nearest(cx: number, cy: number, k = 1): QuadTreeEntry<V>[] {
    this._queries++;
    const all: Array<{ entry: QuadTreeEntry<V>; dist2: number }> = [];
    this.collectAll(this.root, cx, cy, all);
    all.sort((a, b) => a.dist2 - b.dist2);
    return all.slice(0, k).map((item) => item.entry);
  }

  private collectAll(
    node: QuadTreeNode<V>,
    cx: number,
    cy: number,
    result: Array<{ entry: QuadTreeEntry<V>; dist2: number }>,
  ): void {
    if (node.nw !== null) {
      this.collectAll(node.nw, cx, cy, result);
      this.collectAll(node.ne!, cx, cy, result);
      this.collectAll(node.sw!, cx, cy, result);
      this.collectAll(node.se!, cx, cy, result);
      return;
    }

    for (const entry of node.entries) {
      const dx = entry.x - cx;
      const dy = entry.y - cy;
      result.push({ entry, dist2: dx * dx + dy * dy });
    }
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    const opts = {
      x: this.root.x,
      y: this.root.y,
      width: this.root.width,
      height: this.root.height,
    };
    this.root = createNode<V>(
      opts.x,
      opts.y,
      opts.width,
      opts.height,
      0,
    );
    this._size = 0;
    this._currentMaxDepth = 0;
  }

  toArray(): QuadTreeEntry<V>[] {
    const result: QuadTreeEntry<V>[] = [];
    this.collectEntries(this.root, result);
    return result;
  }

  private collectEntries(
    node: QuadTreeNode<V>,
    result: QuadTreeEntry<V>[],
  ): void {
    if (node.nw !== null) {
      this.collectEntries(node.nw, result);
      this.collectEntries(node.ne!, result);
      this.collectEntries(node.sw!, result);
      this.collectEntries(node.se!, result);
      return;
    }
    for (const entry of node.entries) {
      result.push(entry);
    }
  }

  forEach(
    callback: (entry: QuadTreeEntry<V>, index: number) => void,
  ): void {
    const entries = this.toArray();
    for (let i = 0; i < entries.length; i++) {
      callback(entries[i]!, i);
    }
  }

  [Symbol.iterator](): Iterator<QuadTreeEntry<V>> {
    const entries = this.toArray();
    let index = 0;
    return {
      next: () => {
        if (index < entries.length) {
          const result = { value: entries[index]!, done: false };
          index++;
          return result;
        }
        return { value: undefined as unknown as QuadTreeEntry<V>, done: true };
      },
    };
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.root.x,
      y: this.root.y,
      width: this.root.width,
      height: this.root.height,
    };
  }

  getStatistics(): QuadTreeMapStatistics {
    return {
      inserts: this._inserts,
      deletes: this._deletes,
      queries: this._queries,
      subdivisions: this._subdivisions,
      maxDepth: this._currentMaxDepth,
    };
  }
}
