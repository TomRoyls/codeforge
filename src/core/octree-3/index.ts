type Point3D = { x: number; y: number; z: number };
type OctreeItem<T> = { point: Point3D; data: T };

class OctreeNode<T> {
  items: OctreeItem<T>[] = [];
  children: (OctreeNode<T> | null)[] = new Array(8).fill(null);
  center: Point3D;
  size: number;
  hasChildren: boolean = false;

  constructor(center: Point3D, size: number) {
    if (size < 1) throw new RangeError('size must be >= 1')

    this.center = center;
    this.size = size;
  }

  getOctantIndex(point: Point3D): number {
    let index = 0;
    if (point.x >= this.center.x) index |= 1;
    if (point.y >= this.center.y) index |= 2;
    if (point.z >= this.center.z) index |= 4;
    return index;
  }

  getOctantCenter(index: number): Point3D {
    const halfSize = this.size / 4;
    const x = index & 1 ? this.center.x + halfSize : this.center.x - halfSize;
    const y = index & 2 ? this.center.y + halfSize : this.center.y - halfSize;
    const z = index & 4 ? this.center.z + halfSize : this.center.z - halfSize;
    return { x, y, z };
  }

  subdivide(_maxItems: number): void {
    const halfSize = this.size / 2;
    for (let i = 0; i < 8; i++) {
      const octantCenter = this.getOctantCenter(i);
      this.children[i] = new OctreeNode<T>(octantCenter, halfSize);
    }
    this.hasChildren = true;

    const oldItems = this.items;
    this.items = [];
    for (const item of oldItems) {
      const index = this.getOctantIndex(item.point);
      this.children[index]!.items.push(item);
    }
  }

  insert(point: Point3D, data: T, maxItems: number): boolean {
    if (!this.containsPoint(point)) {
      return false;
    }

    if (!this.hasChildren) {
      this.items.push({ point, data });
      if (this.items.length > maxItems && this.size > 1) {
        this.subdivide(maxItems);
      }
      return true;
    }

    const index = this.getOctantIndex(point);
    return this.children[index]!.insert(point, data, maxItems);
  }

  containsPoint(point: Point3D): boolean {
    const halfSize = this.size / 2;
    return (
      point.x >= this.center.x - halfSize &&
      point.x <= this.center.x + halfSize &&
      point.y >= this.center.y - halfSize &&
      point.y <= this.center.y + halfSize &&
      point.z >= this.center.z - halfSize &&
      point.z <= this.center.z + halfSize
    );
  }

  remove(point: Point3D, maxItems: number): boolean {
    if (!this.containsPoint(point)) {
      return false;
    }

    if (!this.hasChildren) {
      const index = this.items.findIndex(
        (item) =>
          item.point.x === point.x &&
          item.point.y === point.y &&
          item.point.z === point.z
      );
      if (index !== -1) {
        this.items.splice(index, 1);
        return true;
      }
      return false;
    }

    const octantIndex = this.getOctantIndex(point);
    const result = this.children[octantIndex]!.remove(point, maxItems);
    if (result) {
      this.tryMerge(maxItems);
    }
    return result;
  }

  tryMerge(maxItems: number): void {
    if (!this.hasChildren) return;

    let totalCount = 0;
    for (let i = 0; i < 8; i++) {
      if (this.children[i]!.hasChildren) return;
      totalCount += this.children[i]!.items.length;
    }

    if (totalCount <= maxItems) {
      this.items = [];
      for (let i = 0; i < 8; i++) {
        this.items.push(...this.children[i]!.items);
        this.children[i] = null;
      }
      this.hasChildren = false;
    }
  }

  query(center: Point3D, radius: number): OctreeItem<T>[] {
    const results: OctreeItem<T>[] = [];

    if (!this.intersectsSphere(center, radius)) {
      return results;
    }

    if (!this.hasChildren) {
      for (const item of this.items) {
        const distanceSquared =
          Math.pow(item.point.x - center.x, 2) +
          Math.pow(item.point.y - center.y, 2) +
          Math.pow(item.point.z - center.z, 2);
        if (distanceSquared <= radius * radius) {
          results.push(item);
        }
      }
      return results;
    }

    for (let i = 0; i < 8; i++) {
      results.push(...this.children[i]!.query(center, radius));
    }

    return results;
  }

  intersectsSphere(center: Point3D, radius: number): boolean {
    const halfSize = this.size / 2;
    const minX = this.center.x - halfSize;
    const maxX = this.center.x + halfSize;
    const minY = this.center.y - halfSize;
    const maxY = this.center.y + halfSize;
    const minZ = this.center.z - halfSize;
    const maxZ = this.center.z + halfSize;

    const closestX = Math.max(minX, Math.min(center.x, maxX));
    const closestY = Math.max(minY, Math.min(center.y, maxY));
    const closestZ = Math.max(minZ, Math.min(center.z, maxZ));

    const distanceSquared =
      Math.pow(center.x - closestX, 2) +
      Math.pow(center.y - closestY, 2) +
      Math.pow(center.z - closestZ, 2);

    return distanceSquared <= radius * radius;
  }

  contains(point: Point3D): boolean {
    if (!this.containsPoint(point)) {
      return false;
    }

    if (!this.hasChildren) {
      return this.items.some(
        (item) =>
          item.point.x === point.x &&
          item.point.y === point.y &&
          item.point.z === point.z
      );
    }

    const index = this.getOctantIndex(point);
    return this.children[index]!.contains(point);
  }

  count(): number {
    if (!this.hasChildren) {
      return this.items.length;
    }

    let count = 0;
    for (let i = 0; i < 8; i++) {
      count += this.children[i]!.count();
    }
    return count;
  }

  toArray(): OctreeItem<T>[] {
    if (!this.hasChildren) {
      return [...this.items];
    }

    const results: OctreeItem<T>[] = [];
    for (let i = 0; i < 8; i++) {
      results.push(...this.children[i]!.toArray());
    }
    return results;
  }

  clear(): void {
    this.items = [];
    this.children = new Array(8).fill(null);
    this.hasChildren = false;
  }
}

export class Octree3<T> {
  private root: OctreeNode<T>;
  private maxItems: number;

  constructor(center: Point3D, size: number, maxItems: number = 8) {
    if (size <= 0) {
      throw new Error("Size must be positive");
    }
    if (maxItems <= 0) {
      throw new Error("maxItems must be positive");
    }
    this.root = new OctreeNode<T>(center, size);
    this.maxItems = maxItems;
  }

  insert(point: Point3D, data: T): boolean {
    return this.root.insert(point, data, this.maxItems);
  }

  remove(point: Point3D): boolean {
    return this.root.remove(point, this.maxItems);
  }

  query(center: Point3D, radius: number): OctreeItem<T>[] {
    return this.root.query(center, radius);
  }

  contains(point: Point3D): boolean {
    return this.root.contains(point);
  }

  get size(): number {
    return this.root.count();
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  clear(): void {
    this.root.clear();
  }

  toArray(): OctreeItem<T>[] {
    return this.root.toArray();
  }

  getBounds(): { center: Point3D; size: number } {
    return {
      center: { ...this.root.center },
      size: this.root.size
    };
  }

  [Symbol.iterator](): Iterator<OctreeItem<T>> {
    const nodeStack: OctreeNode<T>[] = [this.root];
    let buffer: OctreeItem<T>[] = [];
    let bi = 0;
    return {
      next: () => {
        if (bi < buffer.length) {
          return { value: buffer[bi++]!, done: false };
        }
        while (nodeStack.length > 0) {
          const node = nodeStack.pop()!;
          buffer = node.items;
          bi = 0;
          if (node.hasChildren) {
            for (let i = 7; i >= 0; i--) {
              const child = node.children[i];
              if (child) {
                nodeStack.push(child);
              }
            }
          }
          if (buffer.length > 0) {
            return { value: buffer[bi++]!, done: false };
          }
        }
        return { value: undefined as unknown as OctreeItem<T>, done: true };
      }
    };
  }
}
