export type { RecursiveSegTree } from './index.js'

export type RecursiveSegTreeOptions = {
  merge?: (a: number, b: number) => number
  identity?: number
}

export type ForEachCallback = (item: number, index: number) => void
