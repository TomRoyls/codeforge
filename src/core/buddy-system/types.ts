export interface AllocationResult {
  address: number
  blockSize: number
}

export interface BlockInfo {
  address: number
  size: number
}

export interface BuddySystemState {
  totalSize: number
  allocatedBlocks: Map<number, number>
  freeLists: Map<number, number[]>
}
