export class HeapSelect {
  selectK(arr: number[], k: number): number[] {
    if (k >= arr.length) return [...arr].sort((a, b) => a - b)
    const minHeap = arr.slice(0, k)
    minHeap.sort((a, b) => a - b)

    for (let i = k; i < arr.length; i++) {
      if (arr[i]! > minHeap[0]!) {
        minHeap[0] = arr[i]!
        this.bubbleDown(minHeap, 0)
      }
    }
    return minHeap.sort((a, b) => b - a)
  }

  selectKSmallest(arr: number[], k: number): number[] {
    if (k >= arr.length) return [...arr].sort((a, b) => a - b)
    const maxHeap = arr.slice(0, k)
    maxHeap.sort((a, b) => b - a)

    for (let i = k; i < arr.length; i++) {
      if (arr[i]! < maxHeap[0]!) {
        maxHeap[0] = arr[i]!
        this.bubbleDownMax(maxHeap, 0)
      }
    }
    return maxHeap.sort((a, b) => a - b)
  }

  private bubbleDown(heap: number[], i: number): void {
    const len = heap.length
    while (true) {
      let smallest = i
      const left = 2 * i + 1
      const right = 2 * i + 2
      if (left < len && heap[left]! < heap[smallest]!) smallest = left
      if (right < len && heap[right]! < heap[smallest]!) smallest = right
      if (smallest !== i) { [heap[i], heap[smallest]] = [heap[smallest]!, heap[i]!]; i = smallest }
      else break
    }
  }

  private bubbleDownMax(heap: number[], i: number): void {
    const len = heap.length
    while (true) {
      let largest = i
      const left = 2 * i + 1
      const right = 2 * i + 2
      if (left < len && heap[left]! > heap[largest]!) largest = left
      if (right < len && heap[right]! > heap[largest]!) largest = right
      if (largest !== i) { [heap[i], heap[largest]] = [heap[largest]!, heap[i]!]; i = largest }
      else break
    }
  }

  get name(): string { return 'HeapSelect' }

  toString(): string { return JSON.stringify({ name: this.name }) }
  toJSON(): Record<string, string> { return { name: this.name } }
  clone(): HeapSelect { return new HeapSelect() }
  equals(other: unknown): boolean { return other instanceof HeapSelect }
  toArray(): string[] { return ['heap-select'] }
}
