export interface ModularQueueOptions {
  capacity: number
  overwrite?: boolean
}

export interface ModularQueueStats {
  capacity: number
  size: number
  isEmpty: boolean
  isFull: boolean
  utilization: number
  overwriteEnabled: boolean
}
