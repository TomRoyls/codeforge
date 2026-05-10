import type { PagedPriorityQueueOptions, Page } from './types.js'
import { DEFAULT_PAGE_SIZE, DEFAULT_COMPARATOR } from './types.js'

export class PagedPriorityQueue<T = number> {
  private _pages: Page<T>[]
  private _size: number
  private _pageSize: number
  private _comparator: (a: T, b: T) => number

  constructor(options?: PagedPriorityQueueOptions<T>) {
    this._pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE
    this._comparator = options?.comparator ?? DEFAULT_COMPARATOR<T>
    this._pages = []
    this._size = 0
  }

  enqueue(item: T): void {
    const globalIndex = this._size
    const pageIndex = Math.floor(globalIndex / this._pageSize)
    const offset = globalIndex % this._pageSize

    if (pageIndex >= this._pages.length) {
      this._pages.push({ elements: new Array(this._pageSize), size: 0 })
    }

    const page = this._pages[pageIndex]!
    page.elements[offset] = item
    page.size = Math.max(page.size, offset + 1)
    this._size++

    this.siftUp(this._size - 1)
  }

  dequeue(): T | undefined {
    if (this._size === 0) return undefined

    const root = this.getAt(0)!
    const lastIndex = this._size - 1

    if (lastIndex === 0) {
      this._size = 0
      this.trimPages()
      return root
    }

    const last = this.getAt(lastIndex)!
    this.setAt(0, last)
    this._size--

    const lastPageIndex = Math.floor(lastIndex / this._pageSize)
    const lastPage = this._pages[lastPageIndex]!
    lastPage.size--
    if (lastPage.size === 0 && lastPageIndex === this._pages.length - 1) {
      this._pages.pop()
    } else if (lastPage.size < this._pageSize) {
      lastPage.elements[lastPage.size] = undefined as T
    }

    this.siftDown(0)
    this.trimPages()
    return root
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined
    return this.getAt(0)
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._pages = []
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    const tempQueue = new PagedPriorityQueue<T>({
      pageSize: this._pageSize,
      comparator: this._comparator,
    })
    for (let i = 0; i < this._size; i++) {
      tempQueue.enqueue(this.getAt(i)!)
    }
    while (!tempQueue.isEmpty) {
      result.push(tempQueue.dequeue()!)
    }
    return result
  }

  contains(item: T): boolean {
    for (let i = 0; i < this._size; i++) {
      if (this.getAt(i) === item) return true
    }
    return false
  }

  remove(item: T): boolean {
    let foundIndex = -1
    for (let i = 0; i < this._size; i++) {
      if (this.getAt(i) === item) {
        foundIndex = i
        break
      }
    }
    if (foundIndex === -1) return false

    if (foundIndex === this._size - 1) {
      const pageIdx = Math.floor(foundIndex / this._pageSize)
      const page = this._pages[pageIdx]!
      page.size--
      if (page.size === 0 && pageIdx === this._pages.length - 1) {
        this._pages.pop()
      }
      this._size--
      return true
    }

    const lastIndex = this._size - 1
    const lastItem = this.getAt(lastIndex)!
    this.setAt(foundIndex, lastItem)

    const lastPageIdx = Math.floor(lastIndex / this._pageSize)
    const lastPage = this._pages[lastPageIdx]!
    lastPage.size--
    if (lastPage.size === 0 && lastPageIdx === this._pages.length - 1) {
      this._pages.pop()
    }
    this._size--

    this.siftDown(foundIndex)
    this.siftUp(foundIndex)
    return true
  }

  update(item: T, newItem: T): boolean {
    for (let i = 0; i < this._size; i++) {
      if (this.getAt(i) === item) {
        this.setAt(i, newItem)
        this.siftDown(i)
        this.siftUp(i)
        return true
      }
    }
    return false
  }

  merge(other: PagedPriorityQueue<T>): void {
    const count = other._size
    for (let i = 0; i < count; i++) {
      this.enqueue(other.getAt(i)!)
    }
  }

  pageCount(): number {
    if (this._size === 0) return 0
    return Math.ceil(this._size / this._pageSize)
  }

  drain(): T[] {
    const result: T[] = []
    while (!this.isEmpty) {
      result.push(this.dequeue()!)
    }
    return result
  }

  private getAt(globalIndex: number): T | undefined {
    const pageIndex = Math.floor(globalIndex / this._pageSize)
    const offset = globalIndex % this._pageSize
    const page = this._pages[pageIndex]
    if (!page) return undefined
    return page.elements[offset]
  }

  private setAt(globalIndex: number, value: T): void {
    const pageIndex = Math.floor(globalIndex / this._pageSize)
    const offset = globalIndex % this._pageSize
    const page = this._pages[pageIndex]!
    page.elements[offset] = value
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / 2)
  }

  private leftChild(index: number): number {
    return 2 * index + 1
  }

  private rightChild(index: number): number {
    return 2 * index + 2
  }

  private swap(i: number, j: number): void {
    const temp = this.getAt(i)!
    this.setAt(i, this.getAt(j)!)
    this.setAt(j, temp)
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const p = this.parent(index)
      const current = this.getAt(index)!
      const parentVal = this.getAt(p)!
      if (this._comparator(current, parentVal) < 0) {
        this.swap(index, p)
        index = p
      } else {
        break
      }
    }
  }

  private siftDown(index: number): void {
    while (true) {
      let smallest = index
      const left = this.leftChild(index)
      const right = this.rightChild(index)

      if (left < this._size) {
        const leftVal = this.getAt(left)!
        const smallestVal = this.getAt(smallest)!
        if (this._comparator(leftVal, smallestVal) < 0) {
          smallest = left
        }
      }

      if (right < this._size) {
        const rightVal = this.getAt(right)!
        const smallestVal = this.getAt(smallest)!
        if (this._comparator(rightVal, smallestVal) < 0) {
          smallest = right
        }
      }

      if (smallest !== index) {
        this.swap(index, smallest)
        index = smallest
      } else {
        break
      }
    }
  }

  private trimPages(): void {
    while (this._pages.length > 0) {
      const lastPage = this._pages[this._pages.length - 1]!
      if (lastPage.size === 0) {
        this._pages.pop()
      } else {
        break
      }
    }
  }
}

export { DEFAULT_PAGE_SIZE, DEFAULT_COMPARATOR } from './types.js'
export type { PagedPriorityQueueOptions, Page } from './types.js'
