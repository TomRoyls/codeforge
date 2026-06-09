export class KDTree4<T = number[]> {
  private root: KDNode | null = null;
  private k: number;
  private sizeValue: number = 0;

  constructor(points?: T[] | number[][], k: number = 2) {
    this.k = k;
    if (points) {
      for (const point of points) {
        this.insert(point as number[]);
      }
    }
  }

  insert(point: number[]): void {
    this.root = this.insertNode(this.root, point, 0);
  }

  private insertNode(node: KDNode | null, point: number[], depth: number): KDNode {
    if (node === null) {
      this.sizeValue++;
      return { point, left: null, right: null };
    }

    const axis = depth % this.k;
    const pointAxis = point[axis]!;
    const nodeAxis = node.point[axis]!;
    if (pointAxis < nodeAxis) {
      node.left = this.insertNode(node.left, point, depth + 1);
    } else {
      node.right = this.insertNode(node.right, point, depth + 1);
    }

    return node;
  }

  delete(point: number[]): boolean {
    if (!this.contains(point)) {
      return false;
    }
    this.root = this.removeNode(this.root, point, 0);
    this.sizeValue--;
    return true;
  }

  private removeNode(node: KDNode | null, point: number[], depth: number): KDNode | null {
    if (node === null) {
      return null;
    }

    const axis = depth % this.k;

    if (this.pointsEqual(node.point, point)) {
      if (node.right !== null) {
        const minNode = this.findMin(node.right, axis, depth + 1);
        node.point = minNode.point;
        node.right = this.removeNode(node.right, minNode.point, depth + 1);
      } else if (node.left !== null) {
        const minNode = this.findMin(node.left, axis, depth + 1);
        node.point = minNode.point;
        node.right = this.removeNode(node.left, minNode.point, depth + 1);
        node.left = null;
      } else {
        return null;
      }
    } else {
      const pointAxis = point[axis]!;
      const nodeAxis = node.point[axis]!;
      if (pointAxis < nodeAxis) {
        node.left = this.removeNode(node.left, point, depth + 1);
      } else {
        node.right = this.removeNode(node.right, point, depth + 1);
      }
    }

    return node;
  }

  private findMin(node: KDNode, axis: number, depth: number): KDNode {
    const currentAxis = depth % this.k;
    if (currentAxis === axis) {
      if (node.left === null) {
        return node;
      }
      return this.findMin(node.left, axis, depth + 1);
    } else {
      const leftMin = node.left ? this.findMin(node.left, axis, depth + 1) : null;
      const rightMin = node.right ? this.findMin(node.right, axis, depth + 1) : null;
      let min = node;
      const minAxis = min.point[axis]!;
      if (leftMin && leftMin.point[axis]! < minAxis) {
        min = leftMin;
      }
      const currentMinAxis = min.point[axis]!;
      if (rightMin && rightMin.point[axis]! < currentMinAxis) {
        min = rightMin;
      }
      return min;
    }
  }

  search(point: number[]): number[] | null {
    const node = this.searchNode(this.root, point, 0);
    return node ? node.point : null;
  }

  contains(point: number[]): boolean {
    return this.searchNode(this.root, point, 0) !== null;
  }

  private searchNode(node: KDNode | null, point: number[], depth: number): KDNode | null {
    if (node === null) {
      return null;
    }

    if (this.pointsEqual(node.point, point)) {
      return node;
    }

    const axis = depth % this.k;
    const pointAxis = point[axis]!;
    const nodeAxis = node.point[axis]!;
    if (pointAxis < nodeAxis) {
      return this.searchNode(node.left, point, depth + 1);
    } else {
      return this.searchNode(node.right, point, depth + 1);
    }
  }

  nearestNeighbor(target: number[]): number[] | null {
    if (this.root === null) {
      return null;
    }
    let nearest: KDNode = this.root;
    let minDist = this.squaredDistance(this.root.point, target);

    const search = (node: KDNode | null, depth: number): void => {
      if (node === null) {
        return;
      }

      const dist = this.squaredDistance(node.point, target);
      if (dist < minDist) {
        minDist = dist;
        nearest = node;
      }

      const axis = depth % this.k;
      const targetAxis = target[axis]!;
      const nodeAxis = node.point[axis]!;
      const diff = targetAxis - nodeAxis;
      const near = diff < 0 ? node.left : node.right;
      const far = diff < 0 ? node.right : node.left;

      search(near, depth + 1);

      if (diff * diff < minDist) {
        search(far, depth + 1);
      }
    };

    search(this.root, 0);
    return nearest.point;
  }

  kNearestNeighbors(target: number[], k: number): number[][] {
    if (this.root === null || k <= 0) {
      return [];
    }

    const neighbors: { point: number[]; dist: number }[] = [];

    const search = (node: KDNode | null, depth: number): void => {
      if (node === null) {
        return;
      }

      const dist = this.squaredDistance(node.point, target);
      if (neighbors.length < k || dist < neighbors[neighbors.length - 1]!.dist) {
        neighbors.push({ point: node.point, dist });
        neighbors.sort((a, b) => a.dist - b.dist);
        if (neighbors.length > k) {
          neighbors.pop();
        }
      }

      const axis = depth % this.k;
      const targetAxis = target[axis]!;
      const nodeAxis = node.point[axis]!;
      const diff = targetAxis - nodeAxis;
      const near = diff < 0 ? node.left : node.right;
      const far = diff < 0 ? node.right : node.left;

      search(near, depth + 1);

      if (neighbors.length < k || diff * diff < neighbors[neighbors.length - 1]!.dist) {
        search(far, depth + 1);
      }
    };

    search(this.root, 0);
    return neighbors.map((n) => n.point);
  }

  rangeSearch(min: number[], max: number[]): number[][] {
    const results: number[][] = [];

    const search = (node: KDNode | null, depth: number): void => {
      if (node === null) {
        return;
      }

      const axis = depth % this.k;

      if (this.inRange(node.point, min, max)) {
        results.push(node.point);
      }

      const nodeAxis = node.point[axis]!;
      const minAxis = min[axis]!;
      const maxAxis = max[axis]!;

      if (minAxis <= nodeAxis) {
        search(node.left, depth + 1);
      }

      if (maxAxis >= nodeAxis) {
        search(node.right, depth + 1);
      }
    };

    search(this.root, 0);
    return results;
  }

  min(axis: number): number[] | null {
    if (this.root === null) {
      return null;
    }
    const node = this.findMin(this.root, axis, 0);
    return node.point;
  }

  max(axis: number): number[] | null {
    if (this.root === null) {
      return null;
    }
    const node = this.findMax(this.root, axis, 0);
    return node.point;
  }

  private findMax(node: KDNode, axis: number, depth: number): KDNode {
    const currentAxis = depth % this.k;
    if (currentAxis === axis) {
      if (node.right === null) {
        return node;
      }
      return this.findMax(node.right, axis, depth + 1);
    } else {
      const leftMax = node.left ? this.findMax(node.left, axis, depth + 1) : null;
      const rightMax = node.right ? this.findMax(node.right, axis, depth + 1) : null;
      let max = node;
      const maxAxis = max.point[axis]!;
      if (leftMax && leftMax.point[axis]! > maxAxis) {
        max = leftMax;
      }
      const currentMaxAxis = max.point[axis]!;
      if (rightMax && rightMax.point[axis]! > currentMaxAxis) {
        max = rightMax;
      }
      return max;
    }
  }

  bulkInsert(points: number[][]): void {
    for (const point of points) {
      this.insert(point);
    }
  }

  forEach(callback: (point: number[]) => void): void {
    const traverse = (node: KDNode | null): void => {
      if (node === null) {
        return;
      }
      traverse(node.left);
      callback(node.point);
      traverse(node.right);
    };

    traverse(this.root);
  }

  toArray(): number[][] {
    const result: number[][] = [];

    const traverse = (node: KDNode | null): void => {
      if (node === null) {
        return;
      }
      traverse(node.left);
      result.push(node.point);
      traverse(node.right);
    };

    traverse(this.root);
    return result;
  }

  get size(): number {
    return this.sizeValue;
  }

  get isEmpty(): boolean {
    return this.sizeValue === 0;
  }

  clear(): void {
    this.root = null;
    this.sizeValue = 0;
  }

  getTimeComplexity(): string {
    if (this.sizeValue === 0) {
      return 'O(1)';
    }
    if (this.sizeValue === 1) {
      return 'O(1)';
    }
    return `O(log ${this.sizeValue})`;
  }

  private pointsEqual(p1: number[], p2: number[]): boolean {
    for (let i = 0; i < this.k; i++) {
      if (p1[i]! !== p2[i]!) {
        return false;
      }
    }
    return true;
  }

  private squaredDistance(p1: number[], p2: number[]): number {
    let sum = 0;
    for (let i = 0; i < this.k; i++) {
      const diff = p1[i]! - p2[i]!;
      sum += diff * diff;
    }
    return sum;
  }

  private inRange(point: number[], min: number[], max: number[]): boolean {
    for (let i = 0; i < this.k; i++) {
      const pointAxis = point[i]!;
      const minAxis = min[i]!;
      const maxAxis = max[i]!;
      if (pointAxis < minAxis || pointAxis > maxAxis) {
        return false;
      }
    }
    return true;
  }

  [Symbol.iterator](): Iterator<number[]> {
    const stack: KDNode[] = [];
    let current: KDNode | null = this.root;
    return {
      next: () => {
        while (current !== null || stack.length > 0) {
          if (current !== null) {
            stack.push(current);
            current = current.left;
            continue;
          }
          current = stack.pop()!;
          const value = current.point;
          current = current.right;
          return { value, done: false };
        }
        return { value: undefined as unknown as number[], done: true };
      }
    };
  }
}

interface KDNode {
  point: number[];
  left: KDNode | null;
  right: KDNode | null;
}
