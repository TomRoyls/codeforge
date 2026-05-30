import { PriorityQueue } from './priority-queue.js'

export class MedianMaintenance {
  private maxHeap = new PriorityQueue<number>({ comparator: (a, b) => b - a })
  private minHeap = new PriorityQueue<number>({ comparator: (a, b) => a - b })

  get size(): number {
    return this.maxHeap.size + this.minHeap.size
  }

  get isEmpty(): boolean {
    return this.size === 0
  }

  add(value: number): void {
    if (this.maxHeap.size === 0 || value <= this.maxHeap.peek()!) {
      this.maxHeap.enqueue(value)
    } else {
      this.minHeap.enqueue(value)
    }
    this.balance()
  }

  getMedian(): number {
    if (this.size === 0) throw new Error('No elements')
    if (this.maxHeap.size >= this.minHeap.size) {
      return this.maxHeap.peek()!
    }
    return this.minHeap.peek()!
  }

  getRollingMedian(): number {
    if (this.size === 0) throw new Error('No elements')
    if (this.size % 2 === 1) {
      return this.getMedian()
    }
    return (this.maxHeap.peek()! + this.minHeap.peek()!) / 2
  }

  clear(): void {
    while (!this.maxHeap.isEmpty()) this.maxHeap.dequeue()
    while (!this.minHeap.isEmpty()) this.minHeap.dequeue()
  }

  private balance(): void {
    if (this.maxHeap.size > this.minHeap.size + 1) {
      this.minHeap.enqueue(this.maxHeap.dequeue()!)
    } else if (this.minHeap.size > this.maxHeap.size) {
      this.maxHeap.enqueue(this.minHeap.dequeue()!)
    }
  }
}
