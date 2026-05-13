interface RopeNode {
  left: RopeNode | null;
  right: RopeNode | null;
  value: string;
  length: number;
  weight: number;
}

class RopeString2 {
  private root: RopeNode | null;
  private readonly LEAF_SIZE = 64;

  constructor(str?: string) {
    if (str !== undefined) {
      this.root = this.buildFromString(str);
    } else {
      this.root = null;
    }
  }

  get length(): number {
    return this.root ? this.root.length : 0;
  }

  insert(index: number, str: string): void {
    if (str === '') return;

    const newRope = this.buildFromString(str);
    if (!this.root) {
      this.root = newRope;
      return;
    }

    this.root = this.insertAt(this.root!, index, newRope!);
  }

  delete(from: number, to: number): void {
    if (!this.root || from >= to || from < 0 || to > this.root!.length) return;

    this.root = this.deleteRange(this.root, from, to);
  }

  charAt(index: number): string {
    if (!this.root || index < 0 || index >= this.root.length) {
      throw new Error('Index out of bounds');
    }

    return this.charAtImpl(this.root, index);
  }

  substring(from: number, to: number): string {
    if (!this.root) return '';

    from = Math.max(0, from);
    to = Math.min(this.root.length, to);

    if (from >= to) return '';

    return this.substringImpl(this.root, from, to);
  }

  toString(): string {
    return this.root ? this.flatten(this.root) : '';
  }

  concat(other: RopeString2): RopeString2 {
    const result = new RopeString2();
    if (!this.root) {
      result.root = this.cloneTree(other.root);
      return result;
    }

    if (!other.root) {
      result.root = this.cloneTree(this.root);
      return result;
    }

    result.root = this.merge(this.cloneTree(this.root), this.cloneTree(other.root));
    return result;
  }

  split(index: number): [RopeString2, RopeString2] {
    const left = new RopeString2();
    const right = new RopeString2();

    if (!this.root) {
      return [left, right];
    }

    const [leftRoot, rightRoot] = this.splitTree(this.root, index);
    left.root = leftRoot;
    right.root = rightRoot;

    return [left, right];
  }

  indexOf(str: string): number {
    if (!this.root || str === '') return -1;

    const full = this.flatten(this.root);
    return full.indexOf(str);
  }

  private buildFromString(str: string): RopeNode | null {
    if (str === '') return null;

    const nodes: RopeNode[] = [];
    for (let i = 0; i < str.length; i += this.LEAF_SIZE) {
      const chunk = str.slice(i, i + this.LEAF_SIZE);
      nodes.push({
        left: null,
        right: null,
        value: chunk,
        length: chunk.length,
        weight: chunk.length
      });
    }

    return this.buildBalanced(nodes);
  }

  private buildBalanced(nodes: RopeNode[]): RopeNode | null {
    if (nodes.length === 0) return null;
    if (nodes.length === 1) return nodes[0]!;

    const mid = Math.floor(nodes.length / 2);
    const node = nodes[mid]!;

    const leftNodes = nodes.slice(0, mid);
    const rightNodes = nodes.slice(mid + 1);

    node.left = this.buildBalanced(leftNodes);
    node.right = this.buildBalanced(rightNodes);

    this.updateNode(node);
    return node;
  }

  private updateNode(node: RopeNode): void {
    const leftLength = node.left ? node.left.length : 0;
    const rightLength = node.right ? node.right.length : 0;
    node.length = leftLength + rightLength + node.value.length;

    const leftWeight = node.left ? node.left.weight : 0;
    node.weight = leftWeight + node.value.length;
  }

  private insertAt(root: RopeNode, index: number, newRope: RopeNode): RopeNode {
    if (index === 0) {
      return this.merge(newRope!, root)!;
    }

    if (index === root.length) {
      return this.merge(root, newRope!)!;
    }

    const [left, right] = this.splitTree(root, index);
    return this.merge(this.merge(left!, newRope!)!, right!)!;
  }

  private deleteRange(root: RopeNode, from: number, to: number): RopeNode | null {
    if (from <= 0 && to >= root.length) {
      return null;
    }

    if (to <= 0 || from >= root.length) {
      return this.cloneTree(root);
    }

    const [left, middle] = this.splitTree(root, from);
    const [, right] = this.splitTree(middle!, to - from);

    return this.merge(left, right);
  }

  private charAtImpl(root: RopeNode, index: number): string {
    const leftLength = root.left ? root.left.length : 0;

    if (index < leftLength) {
      return this.charAtImpl(root.left!, index);
    }

    const valueStart = leftLength;
    const valueEnd = leftLength + root.value.length;

    if (index < valueEnd) {
      return root.value[index - valueStart]!;
    }

    return this.charAtImpl(root.right!, index - valueEnd);
  }

  private substringImpl(root: RopeNode, from: number, to: number): string {
    if (!root) return '';

    const leftLength = root.left ? root.left.length : 0;
    const valueStart = leftLength;
    const valueEnd = leftLength + root.value.length;

    let result = '';

    if (root.left) {
      const leftFrom = Math.max(from, 0);
      const leftTo = Math.min(to, leftLength);
      if (leftFrom < leftTo) {
        result += this.substringImpl(root.left, leftFrom, leftTo);
      }
    }

    const valueFrom = Math.max(from, valueStart);
    const valueTo = Math.min(to, valueEnd);
    if (valueFrom < valueTo) {
      result += root.value.slice(valueFrom - valueStart, valueTo - valueStart);
    }

    if (root.right) {
      const rightFrom = Math.max(from - valueEnd, 0);
      const rightTo = Math.min(to - valueEnd, root.right.length);
      if (rightFrom < rightTo) {
        result += this.substringImpl(root.right, rightFrom, rightTo);
      }
    }

    return result;
  }

  private flatten(root: RopeNode): string {
    if (!root) return '';

    let result = '';
    if (root.left) result += this.flatten(root.left);
    result += root.value;
    if (root.right) result += this.flatten(root.right);

    return result;
  }

  private merge(left: RopeNode | null, right: RopeNode | null): RopeNode | null {
    if (!left) return right;
    if (!right) return left;

    return {
      left: left,
      right: right,
      value: '',
      length: left.length + right.length,
      weight: left.weight
    };
  }

  private splitTree(root: RopeNode, index: number): [RopeNode | null, RopeNode | null] {
    if (index === 0) {
      return [null, this.cloneTree(root)];
    }

    if (index === root.length) {
      return [this.cloneTree(root), null];
    }

    const leftLength = root.left ? root.left.length : 0;
    const valueStart = leftLength;
    const valueEnd = leftLength + root.value.length;

    if (index < valueStart) {
      const [leftLeft] = this.splitTree(root.left!, index);
      const newLeft: RopeNode = {
        left: leftLeft,
        right: null,
        value: root.value,
        length: (leftLeft ? leftLeft.length : 0) + root.value.length,
        weight: (leftLeft ? leftLeft.weight : 0) + root.value.length
      };
      return [leftLeft, this.merge(newLeft, root.right)];
    }

    if (index < valueEnd) {
      const [leftLeft] = this.splitTree(root.left!, valueStart);
      const [, rightRight] = this.splitTree(root.right!, 0);

      const valueSplit = index - valueStart;
      const valueLeft = root.value.slice(0, valueSplit);
      const valueRight = root.value.slice(valueSplit);

      const leftNode: RopeNode = {
        left: leftLeft,
        right: null,
        value: valueLeft,
        length: (leftLeft ? leftLeft.length : 0) + valueLeft.length,
        weight: (leftLeft ? leftLeft.weight : 0) + valueLeft.length
      };

      const rightNode: RopeNode = {
        left: null,
        right: rightRight,
        value: valueRight,
        length: valueRight.length + (rightRight ? rightRight.length : 0),
        weight: valueRight.length
      };

      return [this.merge(leftLeft, { left: null, right: null, value: valueLeft, length: valueLeft.length, weight: valueLeft.length }), this.merge({ left: null, right: null, value: valueRight, length: valueRight.length, weight: valueRight.length }, rightRight)];
    }

    const [, rightRight] = this.splitTree(root.right!, index - valueEnd);
    return [this.merge(this.cloneTree(root.left), { left: null, right: null, value: root.value, length: root.value.length, weight: root.value.length }), rightRight];
  }

  private cloneTree(root: RopeNode | null): RopeNode | null {
    if (!root) return null;

    return {
      left: this.cloneTree(root.left),
      right: this.cloneTree(root.right),
      value: root.value,
      length: root.length,
      weight: root.weight
    };
  }
}

export { RopeString2 };
