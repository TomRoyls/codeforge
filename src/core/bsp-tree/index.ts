export type LineSegment = { x1: number; y1: number; x2: number; y2: number };
export type Rectangle = { minX: number; minY: number; maxX: number; maxY: number };

interface BSPNode {
  segment: LineSegment;
  front: BSPNode | null;
  back: BSPNode | null;
}

export class BSPTree {
  private root: BSPNode | null = null;
  private segmentCount = 0;

  insert(segment: LineSegment): boolean {
    if (!this.isValidSegment(segment)) {
      return false;
    }
    this.root = this.insertNode(this.root, segment);
    this.segmentCount++;
    return true;
  }

  private isValidSegment(segment: LineSegment): boolean {
    return (
      typeof segment.x1 === 'number' &&
      typeof segment.y1 === 'number' &&
      typeof segment.x2 === 'number' &&
      typeof segment.y2 === 'number' &&
      !isNaN(segment.x1) &&
      !isNaN(segment.y1) &&
      !isNaN(segment.x2) &&
      !isNaN(segment.y2) &&
      (segment.x1 !== segment.x2 || segment.y1 !== segment.y2)
    );
  }

  private insertNode(node: BSPNode | null, segment: LineSegment): BSPNode {
    if (!node) {
      return { segment, front: null, back: null };
    }
    const position = this.classifySegment(segment, node.segment);
    if (position === 'front') {
      node.front = this.insertNode(node.front, segment);
    } else if (position === 'back') {
      node.back = this.insertNode(node.back, segment);
    } else {
      node.front = this.insertNode(node.front, segment);
    }
    return node;
  }

  private classifySegment(segment: LineSegment, partition: LineSegment): 'front' | 'back' | 'split' {
    const p1 = this.classifyPoint(segment.x1, segment.y1, partition);
    const p2 = this.classifyPoint(segment.x2, segment.y2, partition);
    if (p1 === 'front' && p2 === 'front') return 'front';
    if (p1 === 'back' && p2 === 'back') return 'back';
    if (p1 === 'on' && p2 === 'front') return 'front';
    if (p1 === 'front' && p2 === 'on') return 'front';
    if (p1 === 'on' && p2 === 'back') return 'back';
    if (p1 === 'back' && p2 === 'on') return 'back';
    return 'split';
  }

  private classifyPoint(x: number, y: number, partition: LineSegment): 'front' | 'back' | 'on' {
    const dx = partition.x2 - partition.x1;
    const dy = partition.y2 - partition.y1;
    const pdx = x - partition.x1;
    const pdy = y - partition.y1;
    const cross = dx * pdy - dy * pdx;
    if (cross > 0.0001) return 'front';
    if (cross < -0.0001) return 'back';
    return 'on';
  }

  remove(segment: LineSegment): boolean {
    if (!this.root) return false;
    const removed = this.removeNode(this.root, segment);
    if (removed) {
      this.segmentCount--;
      if (this.segmentCount === 0) {
        this.root = null;
      }
    }
    return removed;
  }

  private removeNode(node: BSPNode | null, segment: LineSegment): boolean {
    if (!node) return false;
    const position = this.classifySegment(segment, node.segment);
    if (position === 'front') {
      if (this.removeNode(node.front, segment)) {
        return true;
      }
    } else if (position === 'back') {
      if (this.removeNode(node.back, segment)) {
        return true;
      }
    } else {
      if (this.removeNode(node.front, segment)) {
        return true;
      }
      if (this.removeNode(node.back, segment)) {
        return true;
      }
    }
    if (this.segmentsEqual(node.segment, segment)) {
      const frontSegments = this.collectSegments(node.front);
      const backSegments = this.collectSegments(node.back);
      if (frontSegments.length === 0 && backSegments.length === 0) {
        return true;
      }
      if (frontSegments.length > 0) {
        const first = frontSegments[0];
        node.segment = first;
        frontSegments.shift();
        node.front = this.rebuildTree(frontSegments.concat(backSegments));
        node.back = null;
      } else if (backSegments.length > 0) {
        const first = backSegments[0];
        node.segment = first;
        backSegments.shift();
        node.front = this.rebuildTree(backSegments.concat(frontSegments));
        node.back = null;
      }
      return true;
    }
    return false;
  }

  private rebuildTree(segments: LineSegment[]): BSPNode | null {
    let root: BSPNode | null = null;
    for (const seg of segments) {
      root = this.insertNode(root, seg);
    }
    return root;
  }

  private segmentsEqual(s1: LineSegment, s2: LineSegment): boolean {
    return (
      Math.abs(s1.x1 - s2.x1) < 0.0001 &&
      Math.abs(s1.y1 - s2.y1) < 0.0001 &&
      Math.abs(s1.x2 - s2.x2) < 0.0001 &&
      Math.abs(s1.y2 - s2.y2) < 0.0001
    );
  }

  private collectSegments(node: BSPNode | null): LineSegment[] {
    const segments: LineSegment[] = [];
    if (!node) return segments;
    const stack: BSPNode[] = [node];
    while (stack.length > 0) {
      const current = stack.pop()!;
      segments.push(current.segment);
      if (current.front) stack.push(current.front);
      if (current.back) stack.push(current.back);
    }
    return segments;
  }

  queryPoint(x: number, y: number): LineSegment[] {
    const results: LineSegment[] = [];
    this.queryPointNode(this.root, x, y, results);
    return results;
  }

  private queryPointNode(node: BSPNode | null, x: number, y: number, results: LineSegment[]): void {
    if (!node) return;
    if (this.pointOnSegment(x, y, node.segment)) {
      results.push(node.segment);
      return;
    }
    const classification = this.classifyPoint(x, y, node.segment);
    if (classification === 'back') {
      this.queryPointNode(node.back, x, y, results);
    } else {
      this.queryPointNode(node.front, x, y, results);
      this.queryPointNode(node.back, x, y, results);
    }
  }

  private pointOnSegment(x: number, y: number, segment: LineSegment): boolean {
    const minX = Math.min(segment.x1, segment.x2);
    const maxX = Math.max(segment.x1, segment.x2);
    const minY = Math.min(segment.y1, segment.y2);
    const maxY = Math.max(segment.y1, segment.y2);
    if (x < minX - 0.0001 || x > maxX + 0.0001) return false;
    if (y < minY - 0.0001 || y > maxY + 0.0001) return false;
    const dx = segment.x2 - segment.x1;
    const dy = segment.y2 - segment.y1;
    if (Math.abs(dx) < 0.0001) {
      return Math.abs(x - segment.x1) < 0.0001;
    }
    const slope = dy / dx;
    const expectedY = segment.y1 + slope * (x - segment.x1);
    return Math.abs(y - expectedY) < 0.0001;
  }

  queryRegion(rect: Rectangle): LineSegment[] {
    const results: LineSegment[] = [];
    this.queryRegionNode(this.root, rect, results);
    return results;
  }

  private queryRegionNode(node: BSPNode | null, rect: Rectangle, results: LineSegment[]): void {
    if (!node) return;
    if (this.segmentIntersectsRect(node.segment, rect)) {
      results.push(node.segment);
    }
    const frontClass = this.classifyRect(rect, node.segment, 'front');
    const backClass = this.classifyRect(rect, node.segment, 'back');
    if (frontClass !== 'separate') {
      this.queryRegionNode(node.front, rect, results);
    }
    if (backClass !== 'separate') {
      this.queryRegionNode(node.back, rect, results);
    }
  }

  private segmentIntersectsRect(segment: LineSegment, rect: Rectangle): boolean {
    const segMinX = Math.min(segment.x1, segment.x2);
    const segMaxX = Math.max(segment.x1, segment.x2);
    const segMinY = Math.min(segment.y1, segment.y2);
    const segMaxY = Math.max(segment.y1, segment.y2);
    if (segMaxX < rect.minX || segMinX > rect.maxX) return false;
    if (segMaxY < rect.minY || segMinY > rect.maxY) return false;
    if (
      this.pointInRect(segment.x1, segment.y1, rect) ||
      this.pointInRect(segment.x2, segment.y2, rect)
    ) {
      return true;
    }
    const dx = segment.x2 - segment.x1;
    const dy = segment.y2 - segment.y1;
    if (Math.abs(dx) > 0.0001) {
      for (const y of [rect.minY, rect.maxY]) {
        const t = (y - segment.y1) / dy;
        const x = segment.x1 + dx * t;
        if (x >= rect.minX && x <= rect.maxX) return true;
      }
    }
    if (Math.abs(dy) > 0.0001) {
      for (const x of [rect.minX, rect.maxX]) {
        const t = (x - segment.x1) / dx;
        const y = segment.y1 + dy * t;
        if (y >= rect.minY && y <= rect.maxY) return true;
      }
    }
    return false;
  }

  private pointInRect(x: number, y: number, rect: Rectangle): boolean {
    return (
      x >= rect.minX &&
      x <= rect.maxX &&
      y >= rect.minY &&
      y <= rect.maxY
    );
  }

  private classifyRect(rect: Rectangle, partition: LineSegment, side: 'front' | 'back'): 'separate' | 'intersect' | 'inside' {
    const corners = [
      { x: rect.minX, y: rect.minY },
      { x: rect.maxX, y: rect.minY },
      { x: rect.maxX, y: rect.maxY },
      { x: rect.minX, y: rect.maxY }
    ];
    const classifications = corners.map(p => this.classifyPoint(p.x, p.y, partition));
    const frontCount = classifications.filter(c => c === 'front' || c === 'on').length;
    const backCount = classifications.filter(c => c === 'back' || c === 'on').length;
    if (side === 'front') {
      if (frontCount === 4) return 'inside';
      if (backCount === 4) return 'separate';
      return 'intersect';
    } else {
      if (backCount === 4) return 'inside';
      if (frontCount === 4) return 'separate';
      return 'intersect';
    }
  }

  traverseInOrder(callback: (segment: LineSegment) => void): void {
    this.traverseInOrderNode(this.root, callback);
  }

  private traverseInOrderNode(node: BSPNode | null, callback: (segment: LineSegment) => void): void {
    if (!node) return;
    this.traverseInOrderNode(node.back, callback);
    callback(node.segment);
    this.traverseInOrderNode(node.front, callback);
  }

  traversePreOrder(callback: (segment: LineSegment) => void): void {
    this.traversePreOrderNode(this.root, callback);
  }

  private traversePreOrderNode(node: BSPNode | null, callback: (segment: LineSegment) => void): void {
    if (!node) return;
    callback(node.segment);
    this.traversePreOrderNode(node.front, callback);
    this.traversePreOrderNode(node.back, callback);
  }

  clear(): void {
    this.root = null;
    this.segmentCount = 0;
  }

  get size(): number {
    return this.segmentCount;
  }

  isEmpty(): boolean {
    return this.segmentCount === 0;
  }

  toArray(): LineSegment[] {
    return this.collectSegments(this.root);
  }
}