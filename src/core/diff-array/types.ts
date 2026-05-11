export type { DiffArray } from './index.js'

export type DiffArrayOptions = {
  initial?: number[]
}

export type ForEachCallback = (value: number, index: number) => void
