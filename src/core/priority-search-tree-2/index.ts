export interface Point {
  x: number;
  y: number;
  priority?: number;
}

interface PSTNode {
  point: Point;
  left: PSTNode | null;
  right: PSTNode | null;
  minPriority: number;
}

export class PrioritySearchTree2 {
  private root: PSTNode | null = null;
  private sizeValue: number = 0;
  private priorityCounter: number = 0;

  constructor(points?: Point[]) {
    if (points) {
      for (const point of points) {
        this.insert(point);
      }
    }
  }

  insert(point: Point): void {
    const priority = point.priority !== undefined ? point.priority : this.priorityCounter++;
    const pointWithPriority = { ...point, priority };
    this.root = this.insertNode(this.root, pointWithPriority);
  }

  private insertNode(node: PSTNode | null, point: Point): PSTNode {
    if (node === null) {
      this.sizeValue++;
      return {
        point,
        left: null,
        right: null,
        minPriority: point.priority!
      };
    }

    if (point.x < node.point.x) {
      node.left = this.insertNode(node.left, point);
    } else {
      node.right = this.insertNode(node.right, point);
    }

    node.minPriority = this.getMinPriority(node);
    return node;
  }

  delete(point: Point): boolean {
    if (!this.contains(point)) {
      return false;
    }
    this.root = this.removeNode(this.root, point);
    this.sizeValue--;
    return true;
  }

  private removeNode(node: PSTNode | null, point: Point): PSTNode | null {
    if (node === null) {
      return null;
    }

    if (node.point.x === point.x && node.point.y === point.y) {
      if (node.left === null) {
        return node.right;
      }
      if (node.right === null) {
        return node.left;
      }

      const minRight = this.findMinNode(node.right);
      node.point = minRight.point;
      node.right = this.removeNode(node.right, minRight.point);
    } else if (point.x < node.point.x) {
      node.left = this.removeNode(node.left, point);
    } else {
      node.right = this.removeNode(node.right, point);
    }

    if (node !== null) {
      node.minPriority = this.getMinPriority(node);
    }
    return node;
  }

  private findMinNode(node: PSTNode): PSTNode {
    let current = node;
    while (current.left !== null) {
      current = current.left;
    }
    return current;
  }

  queryRange(minX: number, maxX: number, minY: number, maxY: number): Point[] {
    const results: Point[] = [];

    const search = (node: PSTNode | null): void => {
      if (node === null) {
        return;
      }

      if (node.point.x >= minX && node.point.x <= maxX && node.point.y >= minY && node.point.y <= maxY) {
        results.push(node.point);
      }

      if (node.left !== null && this.canContainMin(node.left, maxX)) {
        search(node.left);
      }

      if (node.right !== null && this.canContainMin(node.right, maxX)) {
        search(node.right);
      }
    };

    search(this.root);
    return results;
  }

  private canContainMin(node: PSTNode, maxX: number): boolean {
    const minXNode = this.getMinX(node);
    return minXNode <= maxX;
  }

  private getMinX(node: PSTNode): number {
    while (node.left !== null) {
      node = node.left;
    }
    return node.point.x;
  }

  findMin(): Point | null {
    if (this.root === null) {
      return null;
    }

    let minPriority = this.root.minPriority;

    const traverse = (node: PSTNode | null): void => {
      if (node === null) {
        return;
      }

      if (node.minPriority < minPriority) {
        minPriority = node.minPriority;
      }

      traverse(node.left);
      traverse(node.right);
    };

    traverse(this.root);

    const minPoint = this.findNodeWithPriority(this.root, minPriority);
    return minPoint;
  }

  private findNodeWithPriority(node: PSTNode | null, priority: number): Point | null {
    if (node === null) {
      return null;
    }

    if (node.point.priority === priority) {
      return node.point;
    }

    const leftResult = this.findNodeWithPriority(node.left, priority);
    if (leftResult !== null) {
      return leftResult;
    }

    return this.findNodeWithPriority(node.right, priority);
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
    this.priorityCounter = 0;
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

  contains(point: Point): boolean {
    return this.searchNode(this.root, point) !== null;
  }

  private searchNode(node: PSTNode | null, point: Point): PSTNode | null {
    if (node === null) {
      return null;
    }

    if (node.point.x === point.x && node.point.y === point.y) {
      return node;
    }

    if (point.x < node.point.x) {
      return this.searchNode(node.left, point);
    } else {
      return this.searchNode(node.right, point);
    }
  }

  private getMinPriority(node: PSTNode): number {
    let min = node.point.priority!;

    if (node.left !== null && node.left.minPriority < min) {
      min = node.left.minPriority;
    }

    if (node.right !== null && node.right.minPriority < min) {
      min = node.right.minPriority;
    }

    return min;
  }
}
