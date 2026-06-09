type Node = true | undefined | Node[];

export class K2Tree2 {
    private readonly K: number = 2;
    private root: Node | undefined;
    private readonly size: number;

    constructor(size?: number) {
        this.size = size ?? 16;
        if (this.size <= 0 || (this.size & (this.size - 1)) !== 0) {
            throw new Error('Size must be a power of 2');
        }
    }

    private validateBounds(row: number, col: number): void {
        if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
            throw new Error(`Index out of bounds: row=${row}, col=${col}, size=${this.size}`);
        }
    }

    set(row: number, col: number): void {
        this.validateBounds(row, col);
        this.root = this.setRecursive(this.root, row, col, this.size);
    }

    private setRecursive(node: Node | undefined, row: number, col: number, currentSize: number): Node {
        if (currentSize === 1) {
            return true;
        }

        const blockSize = currentSize / 2;
        const rowBlock = Math.floor(row / blockSize);
        const colBlock = Math.floor(col / blockSize);
        const childIndex = rowBlock * this.K + colBlock;
        const localRow = row % blockSize;
        const localCol = col % blockSize;

        let children: Node[];
        if (node === true || node === undefined) {
            children = new Array(this.K * this.K).fill(undefined);
        } else {
            children = [...node];
        }

        children[childIndex] = this.setRecursive(children[childIndex], localRow, localCol, blockSize);

        if (children.every(c => c === true)) {
            return true;
        }

        if (children.some(c => c !== true && c !== undefined)) {
            return children;
        }

        return children;
    }

    get(row: number, col: number): boolean {
        this.validateBounds(row, col);
        return this.getRecursive(this.root, row, col, this.size);
    }

    private getRecursive(node: Node | undefined, row: number, col: number, currentSize: number): boolean {
        if (node === undefined) {
            return false;
        }
        if (node === true) {
            return true;
        }
        if (currentSize === 1) {
            return (node as unknown as boolean) === true;
        }

        const blockSize = currentSize / 2;
        const rowBlock = Math.floor(row / blockSize);
        const colBlock = Math.floor(col / blockSize);
        const childIndex = rowBlock * this.K + colBlock;

        return this.getRecursive(node[childIndex], row % blockSize, col % blockSize, blockSize);
    }

    clear(row: number, col: number): void {
        this.validateBounds(row, col);
        this.root = this.clearRecursive(this.root, row, col, this.size);
    }

    private clearRecursive(node: Node | undefined, row: number, col: number, currentSize: number): Node | undefined {
        if (node === undefined) {
            return undefined;
        }
        if (node === true) {
            if (currentSize === 1) {
                return undefined;
            }
            const blockSize = currentSize / 2;
            const children = new Array(this.K * this.K).fill(true);
            const rowBlock = Math.floor(row / blockSize);
            const colBlock = Math.floor(col / blockSize);
            const childIndex = rowBlock * this.K + colBlock;
            const localRow = row % blockSize;
            const localCol = col % blockSize;

            children[childIndex] = this.clearRecursive(true, localRow, localCol, blockSize);

            if (children.every(c => c === true)) {
                return true;
            }

            if (children.every(c => c === undefined)) {
                return undefined;
            }

            return children;
        }

        const blockSize = currentSize / 2;
        const rowBlock = Math.floor(row / blockSize);
        const colBlock = Math.floor(col / blockSize);
        const childIndex = rowBlock * this.K + colBlock;
        const localRow = row % blockSize;
        const localCol = col % blockSize;

        const children = [...node];
        children[childIndex] = this.clearRecursive(children[childIndex], localRow, localCol, blockSize);

        if (children.every(c => c === undefined)) {
            return undefined;
        }

        if (children.every(c => c === true)) {
            return true;
        }

        return children;
    }

    toggle(row: number, col: number): void {
        if (this.get(row, col)) {
            this.clear(row, col);
        } else {
            this.set(row, col);
        }
    }

    row(row: number): number[] {
        if (row < 0 || row >= this.size) {
            throw new Error(`Index out of bounds: row=${row}, size=${this.size}`);
        }
        const result: number[] = [];
        for (let col = 0; col < this.size; col++) {
            if (this.get(row, col)) {
                result.push(col);
            }
        }
        return result;
    }

    col(col: number): number[] {
        if (col < 0 || col >= this.size) {
            throw new Error(`Index out of bounds: col=${col}, size=${this.size}`);
        }
        const result: number[] = [];
        for (let row = 0; row < this.size; row++) {
            if (this.get(row, col)) {
                result.push(row);
            }
        }
        return result;
    }

    count(): number {
        return this.countRecursive(this.root, this.size);
    }

    private countRecursive(node: Node | undefined, currentSize: number): number {
        if (node === undefined) {
            return 0;
        }
        if (node === true) {
            return currentSize * currentSize;
        }
        if (currentSize === 1) {
            return (node as unknown as boolean) === true ? 1 : 0;
        }

        const blockSize = currentSize / 2;
        let total = 0;
        for (const child of node) {
            total += this.countRecursive(child, blockSize);
        }
        return total;
    }

    isEmpty(): boolean {
        return this.root === undefined;
    }

    getMatrixSize(): number {
        return this.size;
    }

    toArray(): boolean[][] {
        const matrix: boolean[][] = [];
        for (let r = 0; r < this.size; r++) {
            matrix[r] = [];
            for (let c = 0; c < this.size; c++) {
                matrix[r]![c] = this.get(r, c);
            }
        }
        return matrix;
    }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  forEach(callback: (item: boolean[], index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toString(): string {
    return `K2Tree2({ size: ${this.size} })`
  }
}
