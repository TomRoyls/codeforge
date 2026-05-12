export class StreamingMedian {
	private maxHeap: number[] = [];
	private minHeap: number[] = [];
	private _size: number = 0;

	get size(): number {
		return this._size;
	}

	get isEmpty(): boolean {
		return this._size === 0;
	}

	add(value: number): void {
		this._size++;

		if (this.maxHeap.length === 0 || value <= this.maxHeap[0]!) {
			this.maxHeapPush(value);
		} else {
			this.minHeapPush(value);
		}

		this.rebalance();
	}

	getMedian(): number {
		if (this._size === 0) {
			throw new Error("Cannot get median of empty streaming median");
		}

		if (this.maxHeap.length > this.minHeap.length) {
			return this.maxHeap[0]!;
		}

		if (this.minHeap.length > this.maxHeap.length) {
			return this.minHeap[0]!;
		}

		return (this.maxHeap[0]! + this.minHeap[0]!) / 2;
	}

	clear(): void {
		this.maxHeap = [];
		this.minHeap = [];
		this._size = 0;
	}

	toArray(): number[] {
		const sorted: number[] = [];
		const maxHeapCopy = [...this.maxHeap];
		const minHeapCopy = [...this.minHeap];

		while (maxHeapCopy.length > 0) {
			sorted.push(this.maxHeapPop(maxHeapCopy));
		}

		sorted.reverse();

		while (minHeapCopy.length > 0) {
			sorted.push(this.minHeapPop(minHeapCopy));
		}

		return sorted;
	}

	private rebalance(): void {
		const lengthDiff = Math.abs(this.maxHeap.length - this.minHeap.length);

		if (lengthDiff > 1) {
			if (this.maxHeap.length > this.minHeap.length) {
				const value = this.maxHeapPop(this.maxHeap);
				this.minHeapPush(value);
			} else {
				const value = this.minHeapPop(this.minHeap);
				this.maxHeapPush(value);
			}
		}
	}

	private maxHeapPush(value: number): void {
		this.maxHeap.push(value);
		this.maxHeapBubbleUp(this.maxHeap.length - 1);
	}

	private maxHeapBubbleUp(index: number): void {
		while (index > 0) {
			const parentIndex = Math.floor((index - 1) / 2);
			if (this.maxHeap[parentIndex]! >= this.maxHeap[index]!) {
				break;
			}
			[this.maxHeap[parentIndex], this.maxHeap[index]] = [this.maxHeap[index]!, this.maxHeap[parentIndex]!];
			index = parentIndex;
		}
	}

	private maxHeapPop(heap: number[]): number {
		const max = heap[0]!;
		const last = heap.pop()!;
		if (heap.length > 0) {
			heap[0] = last;
			this.maxHeapBubbleDown(heap, 0);
		}
		return max;
	}

	private maxHeapBubbleDown(heap: number[], index: number): void {
		const length = heap.length;

		while (true) {
			const leftChildIndex = 2 * index + 1;
			const rightChildIndex = 2 * index + 2;
			let largestIndex = index;

			if (leftChildIndex < length && heap[leftChildIndex]! > heap[largestIndex]!) {
				largestIndex = leftChildIndex;
			}

			if (rightChildIndex < length && heap[rightChildIndex]! > heap[largestIndex]!) {
				largestIndex = rightChildIndex;
			}

			if (largestIndex === index) {
				break;
			}

			[heap[index], heap[largestIndex]] = [heap[largestIndex]!, heap[index]!];
			index = largestIndex;
		}
	}

	private minHeapPush(value: number): void {
		this.minHeap.push(value);
		this.minHeapBubbleUp(this.minHeap.length - 1);
	}

	private minHeapBubbleUp(index: number): void {
		while (index > 0) {
			const parentIndex = Math.floor((index - 1) / 2);
			if (this.minHeap[parentIndex]! <= this.minHeap[index]!) {
				break;
			}
			[this.minHeap[parentIndex], this.minHeap[index]] = [this.minHeap[index]!, this.minHeap[parentIndex]!];
			index = parentIndex;
		}
	}

	private minHeapPop(heap: number[]): number {
		const min = heap[0]!;
		const last = heap.pop()!;
		if (heap.length > 0) {
			heap[0] = last;
			this.minHeapBubbleDown(heap, 0);
		}
		return min;
	}

	private minHeapBubbleDown(heap: number[], index: number): void {
		const length = heap.length;

		while (true) {
			const leftChildIndex = 2 * index + 1;
			const rightChildIndex = 2 * index + 2;
			let smallestIndex = index;

			if (leftChildIndex < length && heap[leftChildIndex]! < heap[smallestIndex]!) {
				smallestIndex = leftChildIndex;
			}

			if (rightChildIndex < length && heap[rightChildIndex]! < heap[smallestIndex]!) {
				smallestIndex = rightChildIndex;
			}

			if (smallestIndex === index) {
				break;
			}

			[heap[index], heap[smallestIndex]] = [heap[smallestIndex]!, heap[index]!];
			index = smallestIndex;
		}
	}
}
