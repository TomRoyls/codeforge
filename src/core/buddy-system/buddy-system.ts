import type { AllocationResult, BlockInfo } from './types.js'

export class BuddySystem {
  private totalSize: number
  private maxOrder: number
  private allocatedBlocks: Map<number, number> = new Map()
  private freeLists: Map<number, number[]> = new Map()

  constructor(totalSize: number) {
    if (totalSize <= 0 || !Number.isInteger(totalSize)) {
      throw new Error('Total size must be a positive integer')
    }
    if (!this.isPowerOfTwo(totalSize)) {
      throw new Error('Total size must be a power of 2')
    }
    this.totalSize = totalSize
    this.maxOrder = Math.log2(totalSize)
    this.freeLists.set(this.maxOrder, [0])
    for (let order = 0; order < this.maxOrder; order++) {
      this.freeLists.set(order, [])
    }
  }

  allocate(size: number): AllocationResult | null {
    if (size <= 0 || !Number.isInteger(size)) {
      throw new Error('Size must be a positive integer')
    }
    const order = this.sizeToOrder(size)
    if (order > this.maxOrder) {
      return null
    }
    const foundOrder = this.findFreeBlock(order)
    if (foundOrder === -1) {
      return null
    }
    const address = this.freeLists.get(foundOrder)!.pop()!
    for (let o = foundOrder - 1; o >= order; o--) {
      const buddyAddress = address + (1 << o)
      this.freeLists.get(o)!.push(buddyAddress)
    }
    const blockSize = 1 << order
    this.allocatedBlocks.set(address, blockSize)
    return { address, blockSize }
  }

  free(address: number): void {
    if (!this.allocatedBlocks.has(address)) {
      throw new Error(`No allocated block at address ${address}`)
    }
    const blockSize = this.allocatedBlocks.get(address)!
    this.allocatedBlocks.delete(address)
    let order = Math.log2(blockSize)
    let currentAddress = address
    while (order < this.maxOrder) {
      const buddyAddress = this.getBuddyAddress(currentAddress, order)
      const freeList = this.freeLists.get(order)!
      const buddyIndex = freeList.indexOf(buddyAddress)
      if (buddyIndex !== -1) {
        freeList.splice(buddyIndex, 1)
        currentAddress = Math.min(currentAddress, buddyAddress)
        order++
      } else {
        break
      }
    }
    this.freeLists.get(order)!.push(currentAddress)
  }

  isAllocated(address: number): boolean {
    for (const [blockAddress, blockSize] of this.allocatedBlocks) {
      if (address >= blockAddress && address < blockAddress + blockSize) {
        return true
      }
    }
    return false
  }

  getBlockSize(address: number): number {
    for (const [blockAddress, blockSize] of this.allocatedBlocks) {
      if (address >= blockAddress && address < blockAddress + blockSize) {
        return blockSize
      }
    }
    for (const [order, freeList] of this.freeLists) {
      const blockSize = 1 << order
      for (const freeAddress of freeList) {
        if (address >= freeAddress && address < freeAddress + blockSize) {
          return blockSize
        }
      }
    }
    throw new Error(`No block at address ${address}`)
  }

  getTotalSize(): number {
    return this.totalSize
  }

  getUsedSize(): number {
    let used = 0
    for (const blockSize of this.allocatedBlocks.values()) {
      used += blockSize
    }
    return used
  }

  getFreeSize(): number {
    return this.totalSize - this.getUsedSize()
  }

  getUtilization(): number {
    return this.getUsedSize() / this.totalSize
  }

  getFragmentation(): number {
    const largestFree = this.getLargestFreeBlock()
    if (largestFree === 0) {
      return 0
    }
    const totalFree = this.getFreeSize()
    if (totalFree === 0) {
      return 0
    }
    return 1 - largestFree / totalFree
  }

  getNumBlocks(): number {
    return this.allocatedBlocks.size
  }

  getLargestFreeBlock(): number {
    for (let order = this.maxOrder; order >= 0; order--) {
      const freeList = this.freeLists.get(order)!
      if (freeList.length > 0) {
        return 1 << order
      }
    }
    return 0
  }

  getFreeBlocks(): BlockInfo[] {
    const blocks: BlockInfo[] = []
    for (const [order, freeList] of this.freeLists) {
      const size = 1 << order
      for (const address of freeList) {
        blocks.push({ address, size })
      }
    }
    blocks.sort((a, b) => a.address - b.address)
    return blocks
  }

  getAllocatedBlocks(): BlockInfo[] {
    const blocks: BlockInfo[] = []
    for (const [address, size] of this.allocatedBlocks) {
      blocks.push({ address, size })
    }
    blocks.sort((a, b) => a.address - b.address)
    return blocks
  }

  reset(): void {
    this.allocatedBlocks.clear()
    for (let order = 0; order <= this.maxOrder; order++) {
      this.freeLists.set(order, [])
    }
    this.freeLists.set(this.maxOrder, [0])
  }

  clone(): BuddySystem {
    const copy = new BuddySystem(this.totalSize)
    copy.allocatedBlocks = new Map(this.allocatedBlocks)
    copy.freeLists = new Map()
    for (const [order, freeList] of this.freeLists) {
      copy.freeLists.set(order, [...freeList])
    }
    return copy
  }

  private isPowerOfTwo(n: number): boolean {
    return (n & (n - 1)) === 0
  }

  private sizeToOrder(size: number): number {
    return Math.ceil(Math.log2(size))
  }

  private findFreeBlock(minOrder: number): number {
    for (let order = minOrder; order <= this.maxOrder; order++) {
      const freeList = this.freeLists.get(order)!
      if (freeList.length > 0) {
        return order
      }
    }
    return -1
  }

  private getBuddyAddress(address: number, order: number): number {
    const blockSize = 1 << order
    return address ^ blockSize
  }
}

export type { AllocationResult, BlockInfo, BuddySystemState } from './types.js'
