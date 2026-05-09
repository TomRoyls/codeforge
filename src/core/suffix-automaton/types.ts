export interface SAMState {
  length: number
  link: number
  transitions: Map<string, number>
  occurrences: number
  firstPos: number
  isCloned: boolean
}
