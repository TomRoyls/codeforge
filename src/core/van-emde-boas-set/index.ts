import type { VanEmdeBoasSetOptions } from "./types.js";

export type { VanEmdeBoasSetOptions };

const DEFAULT_UNIVERSE_SIZE = 65536;

class VanEmdeBoasTreeNode {
	min: number | null;
	max: number | null;
	summary: VanEmdeBoasTreeNode | null;
	clusters: VanEmdeBoasTreeNode[] | null;
	readonly universeSize: number;
	readonly sqrtUpper: number;
	readonly sqrtLower: number;

	constructor(universeSize: number) {
		this.universeSize = universeSize;
		this.min = null;
		this.max = null;
		this.summary = null;
		this.clusters = null;

		if (universeSize <= 2) {
			this.sqrtUpper = 1;
			this.sqrtLower = 1;
		} else {
			this.sqrtUpper = Math.floor(Math.sqrt(universeSize));
			this.sqrtLower = Math.ceil(universeSize / this.sqrtUpper);
		}
	}

	isEmpty(): boolean {
		return this.min === null;
	}

	full(): boolean {
		return this.min !== null && this.max !== null && this.min === this.max && this.universeSize === 2;
	}

	getHigh(x: number): number {
		return Math.floor(x / this.sqrtLower);
	}

	getLow(x: number): number {
		return x % this.sqrtLower;
	}

	getIndex(high: number, low: number): number {
		return high * this.sqrtLower + low;
	}

	insert(x: number): void {
		if (this.isEmpty()) {
			this.min = x;
			this.max = x;
			return;
		}

		if (x < this.min!) {
			const oldMin = this.min!;
			this.min = x;
			x = oldMin;
		}

		if (this.universeSize > 2) {
			if (this.clusters === null) {
				this.clusters = new Array(this.sqrtUpper).fill(null).map(() => new VanEmdeBoasTreeNode(this.sqrtLower));
			}
			if (this.summary === null) {
				this.summary = new VanEmdeBoasTreeNode(this.sqrtUpper);
			}

			const high = this.getHigh(x);
			const low = this.getLow(x);

			if (this.clusters[high]!.isEmpty()) {
				this.summary!.insert(high);
			}
			this.clusters[high]!.insert(low);
		}

		if (x > this.max!) {
			this.max = x;
		}
	}

	delete(x: number): void {
		if (this.isEmpty()) {
			return;
		}

		if (this.min === this.max) {
			if (x === this.min) {
				this.min = null;
				this.max = null;
			}
			return;
		}

		if (this.universeSize === 2) {
			if (x === 0) {
				this.min = 1;
			} else {
				this.min = 0;
			}
			this.max = this.min;
			return;
		}

		if (x === this.min) {
			if (this.summary === null || this.clusters === null) {
				return;
			}
			const firstCluster = this.summary.min!;
			if (firstCluster === null) {
				this.min = null;
				this.max = null;
				return;
			}
			x = this.getIndex(firstCluster, this.clusters[firstCluster]!.min!);
			this.min = x;
		}

		if (this.clusters === null) {
			return;
		}

		const high = this.getHigh(x);
		const low = this.getLow(x);
		this.clusters[high]!.delete(low);

		if (this.clusters[high]!.isEmpty()) {
			if (this.summary !== null) {
				this.summary.delete(high);
			}

			if (x === this.max) {
				if (this.summary === null || this.summary.max === null) {
					this.max = this.min;
				} else {
					this.max = this.getIndex(this.summary.max, this.clusters[this.summary.max]!.max!);
				}
			}
		} else if (x === this.max) {
			this.max = this.getIndex(high, this.clusters[high]!.max!);
		}
	}

	has(x: number): boolean {
		if (x === this.min || x === this.max) {
			return true;
		}
		if (this.isEmpty()) {
			return false;
		}
		if (this.universeSize <= 2) {
			return false;
		}
		if (this.clusters === null) {
			return false;
		}
		const high = this.getHigh(x);
		const low = this.getLow(x);
		return this.clusters[high]!.has(low);
	}

	successor(x: number): number | null {
		if (this.isEmpty()) {
			return null;
		}
		if (this.universeSize === 2) {
			if (x === 0 && this.max === 1) {
				return 1;
			}
			return null;
		}
		if (this.min !== null && x < this.min) {
			return this.min;
		}
		if (this.clusters === null) {
			return null;
		}
		const high = this.getHigh(x);
		const low = this.getLow(x);
		const maxLow = this.clusters[high]!.max;

		if (maxLow !== null && low < maxLow) {
			const offset = this.clusters[high]!.successor(low)!;
			return this.getIndex(high, offset);
		} else {
			if (this.summary === null) {
				return null;
			}
			const succCluster = this.summary.successor(high);
			if (succCluster === null) {
				return null;
			}
			const offset = this.clusters[succCluster]!.min!;
			return this.getIndex(succCluster, offset);
		}
	}

	predecessor(x: number): number | null {
		if (this.isEmpty()) {
			return null;
		}
		if (this.universeSize === 2) {
			if (x === 1 && this.min === 0) {
				return 0;
			}
			return null;
		}
		if (this.max !== null && x > this.max) {
			return this.max;
		}
		if (this.clusters === null) {
			if (this.min !== null && x > this.min) {
				return this.min;
			}
			return null;
		}
		const high = this.getHigh(x);
		const low = this.getLow(x);
		const minLow = this.clusters[high]!.min;

		if (minLow !== null && low > minLow) {
			const offset = this.clusters[high]!.predecessor(low)!;
			return this.getIndex(high, offset);
		} else {
			if (this.summary === null) {
				if (this.min !== null && x > this.min) {
					return this.min;
				}
				return null;
			}
			const predCluster = this.summary.predecessor(high);
			if (predCluster === null) {
				if (this.min !== null && x > this.min) {
					return this.min;
				}
				return null;
			}
			const offset = this.clusters[predCluster]!.max!;
			return this.getIndex(predCluster, offset);
		}
	}

	getMin(): number | null {
		return this.min;
	}

	getMax(): number | null {
		return this.max;
	}

	getSize(): number {
		if (this.isEmpty()) {
			return 0;
		}
		if (this.universeSize === 2) {
			if (this.min !== null && this.max !== null) {
				return this.min === this.max ? 1 : 2;
			}
			return 0;
		}
		if (this.min === this.max) {
			return 1;
		}
		let size = 0;
		if (this.clusters !== null) {
			for (let i = 0; i < this.clusters.length; i++) {
				size += this.clusters[i]!.getSize();
			}
		}
		return size;
	}

	clear(): void {
		this.min = null;
		this.max = null;
		this.summary = null;
		this.clusters = null;
	}

	toArray(): number[] {
		if (this.isEmpty()) {
			return [];
		}
		const result: number[] = [];
		const min = this.min!;
		if (this.universeSize === 2) {
			result.push(min);
			if (this.max !== null && this.max !== min) {
				result.push(this.max);
			}
			return result;
		}

		const visited = new Set<number>();
		let current: number | null = this.min!;
		while (current !== null) {
			result.push(current);
			visited.add(current);
			current = this.successor(current);
			if (current !== null && visited.has(current)) {
				break;
			}
		}
		return result;
	}

	forEach(callback: (value: number) => void): void {
		const array = this.toArray();
		for (const value of array) {
			callback(value);
		}
	}
}

export class VanEmdeBoasSet {
	private readonly root: VanEmdeBoasTreeNode;
	private _size: number;

	constructor(options?: VanEmdeBoasSetOptions) {
		const universeSize = options?.universeSize ?? DEFAULT_UNIVERSE_SIZE;
		this._size = 0;
		this.root = new VanEmdeBoasTreeNode(universeSize);
	}

	insert(x: number): void {
		if (x < 0 || x >= this.root.universeSize) {
			throw new Error(`Value ${x} out of bounds [0, ${this.root.universeSize})`);
		}
		const had = this.has(x);
		this.root.insert(x);
		if (!had) {
			this._size++;
		}
	}

	delete(x: number): void {
		if (x < 0 || x >= this.root.universeSize) {
			throw new Error(`Value ${x} out of bounds [0, ${this.root.universeSize})`);
		}
		const had = this.has(x);
		this.root.delete(x);
		if (had) {
			this._size--;
		}
	}

	has(x: number): boolean {
		if (x < 0 || x >= this.root.universeSize) {
			return false;
		}
		return this.root.has(x);
	}

	successor(x: number): number | null {
		if (x < 0) {
			return this.root.getMin();
		}
		if (x >= this.root.universeSize - 1) {
			return null;
		}
		return this.root.successor(x);
	}

	predecessor(x: number): number | null {
		if (x < 0) {
			return null;
		}
		if (x > this.root.universeSize - 1) {
			return this.root.getMax();
		}
		return this.root.predecessor(x);
	}

	min(): number | null {
		return this.root.getMin();
	}

	max(): number | null {
		return this.root.getMax();
	}

	size(): number {
		return this._size;
	}

	isEmpty(): boolean {
		return this.root.isEmpty();
	}

	clear(): void {
		this.root.clear();
		this._size = 0;
	}

	toArray(): number[] {
		return this.root.toArray();
	}

	forEach(callback: (value: number) => void): void {
		this.root.forEach(callback);
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

  toJSON() {
    return { type: 'VanEmdeBoasSet', items: this.toArray() }
  }
}
