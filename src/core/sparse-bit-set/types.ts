export type { SparseBitSet } from './index.js'

export type SparseBitSetOptions = {
  blockSize?: number
}

export type ForEachCallback = (index: number) => void
