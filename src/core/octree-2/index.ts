export interface OctreeBounds {
  x: number;
  y: number;
  z: number;
  size: number;
}

export interface OctreePoint<V> {
  x: number;
  y: number;
  z: number;
  value: V;
}

export class Octree2<V> {
  private bounds: OctreeBounds;
  private maxPointsPerNode: number;
  private maxDepth: number;
  private root: OctreeNode<V> | null;

  constructor(bounds: OctreeBounds, maxPointsPerNode: number = 8, maxDepth: number = 8) {
    this.bounds = bounds;
    this.maxPointsPerNode = maxPointsPerNode;
    this.maxDepth = maxDepth;
    this.root = null;
  }

  insert(x: number, y: number, z: number, value: V): boolean {
    if (!this.containsBounds(this.bounds, { x, y, z, size: 0 })) {
      return false;
    }

    if (this.root === null) {
      this.root = new OctreeNode<V>(this.bounds, 0);
    }

    return this.root!.insert(x, y, z, value, this.maxPointsPerNode, this.maxDepth);
  }

  queryRange(bounds: OctreeBounds): Array<OctreePoint<V>> {
    if (this.root === null) {
      return [];
    }

    const results: Array<OctreePoint<V>> = [];
    this.root!.queryRange(bounds, results);
    return results;
  }

  remove(x: number, y: number, z: number): boolean {
    if (this.root === null) {
      return false;
    }

    const removed = this.root!.remove(x, y, z);
    if (this.root!.points.length === 0 && this.root!.children === null) {
      this.root = null;
    }
    return removed;
  }

  size(): number {
    if (this.root === null) {
      return 0;
    }
    return this.root!.size();
  }

  clear(): void {
    this.root = null;
  }

  contains(x: number, y: number, z: number): boolean {
    if (this.root === null) {
      return false;
    }
    return this.root!.contains(x, y, z);
  }

  private containsBounds(bounds: OctreeBounds, point: { x: number; y: number; z: number; size: number }): boolean {
    return point.x >= bounds.x && 
           point.x < bounds.x + bounds.size &&
           point.y >= bounds.y && 
           point.y < bounds.y + bounds.size &&
           point.z >= bounds.z && 
           point.z < bounds.z + bounds.size;
  }

  isEmpty(): boolean {
    return this.size() === 0
  }

  has(x: number, y: number, z: number): boolean {
    return this.contains(x, y, z)
  }

  toString(): string {
    return `Octree2()`
  }

  get [Symbol.toStringTag](): string {
    return 'Octree2'
  }
}

class OctreeNode<V> {
  bounds: OctreeBounds;
  points: Array<OctreePoint<V>>;
  children: (OctreeNode<V> | null)[] | null;
  depth: number;

  constructor(bounds: OctreeBounds, depth: number) {
    this.bounds = bounds;
    this.points = [];
    this.children = null;
    this.depth = depth;
  }

  insert(x: number, y: number, z: number, value: V, maxPointsPerNode: number, maxDepth: number): boolean {
    if (this.children !== null) {
      const childIndex = this.getChildIndex(x, y, z);
      const child = this.children![childIndex]!;
      if (child !== null) {
        return child.insert(x, y, z, value, maxPointsPerNode, maxDepth);
      } else {
        this.children![childIndex] = this.createChild(childIndex);
        return this.children![childIndex]!.insert(x, y, z, value, maxPointsPerNode, maxDepth);
      }
    }

    if (this.points.length < maxPointsPerNode || this.depth >= maxDepth) {
      this.points.push({ x, y, z, value });
      return true;
    }

    if (this.depth < maxDepth) {
      this.subdivide();
      for (let i = 0; i < this.points.length; i++) {
        const point = this.points[i]!;
        const childIndex = this.getChildIndex(point.x, point.y, point.z);
        this.children![childIndex]!.insert(point.x, point.y, point.z, point.value, maxPointsPerNode, maxDepth);
      }
      this.points = [];
      const childIndex = this.getChildIndex(x, y, z);
      return this.children![childIndex]!.insert(x, y, z, value, maxPointsPerNode, maxDepth);
    }

    return false;
  }

  queryRange(bounds: OctreeBounds, results: Array<OctreePoint<V>>): void {
    if (!this.intersects(bounds)) {
      return;
    }

    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i]!;
      if (point.x >= bounds.x && 
          point.x < bounds.x + bounds.size &&
          point.y >= bounds.y && 
          point.y < bounds.y + bounds.size &&
          point.z >= bounds.z && 
          point.z < bounds.z + bounds.size) {
        results.push(point);
      }
    }

    if (this.children !== null) {
      for (let i = 0; i < this.children!.length; i++) {
        const child = this.children![i]!;
        if (child !== null) {
          child.queryRange(bounds, results);
        }
      }
    }
  }

  remove(x: number, y: number, z: number): boolean {
    if (this.children !== null) {
      const childIndex = this.getChildIndex(x, y, z);
      const child = this.children![childIndex]!;
      if (child !== null) {
        const removed = child.remove(x, y, z);
        if (child.points.length === 0 && child.children === null) {
          this.children![childIndex] = null;
          if (this.children!.every(c => c === null)) {
            this.children = null;
          }
        }
        return removed;
      }
      return false;
    }

    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i]!;
      if (point.x === x && point.y === y && point.z === z) {
        this.points.splice(i, 1);
        return true;
      }
    }

    return false;
  }

  size(): number {
    let count = this.points.length;
    if (this.children !== null) {
      for (let i = 0; i < this.children!.length; i++) {
        const child = this.children![i]!;
        if (child !== null) {
          count += child.size();
        }
      }
    }
    return count;
  }

  contains(x: number, y: number, z: number): boolean {
    if (this.children !== null) {
      const childIndex = this.getChildIndex(x, y, z);
      const child = this.children![childIndex]!;
      if (child !== null) {
        return child.contains(x, y, z);
      }
      return false;
    }

    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i]!;
      if (point.x === x && point.y === y && point.z === z) {
        return true;
      }
    }

    return false;
  }

  private subdivide(): void {
    this.children = Array(8).fill(null);

    for (let i = 0; i < 8; i++) {
      const child = this.createChild(i);
      this.children![i] = child;
    }
  }

  private createChild(index: number): OctreeNode<V> {
    const _halfSize = this.bounds.size / 2;
    const xOffset = (index & 1) * _halfSize;
    const yOffset = (index & 2) * _halfSize / 2;
    const zOffset = (index & 4) * _halfSize / 4;

    return new OctreeNode<V>({
      x: this.bounds.x + xOffset,
      y: this.bounds.y + yOffset,
      z: this.bounds.z + zOffset,
      size: _halfSize
    }, this.depth + 1);
  }

  private getChildIndex(x: number, y: number, z: number): number {
    const _halfSize = this.bounds.size / 2;
    const midX = this.bounds.x + _halfSize;
    const midY = this.bounds.y + _halfSize;
    const midZ = this.bounds.z + _halfSize;

    let index = 0;
    if (x >= midX) index |= 1;
    if (y >= midY) index |= 2;
    if (z >= midZ) index |= 4;

    return index;
  }

  private intersects(bounds: OctreeBounds): boolean {
    return this.bounds.x < bounds.x + bounds.size &&
           this.bounds.x + this.bounds.size > bounds.x &&
           this.bounds.y < bounds.y + bounds.size &&
           this.bounds.y + this.bounds.size > bounds.y &&
           this.bounds.z < bounds.z + bounds.size &&
           this.bounds.z + this.bounds.size > bounds.z;
  }
}
