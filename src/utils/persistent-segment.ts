export class PersistentSegmentTree {
  private readonly size: number
  private versions: number[][]
  private readonly defaultValue: number
  private readonly combine: (a: number, b: number) => number

  constructor(
    dataOrSize: number[] | number,
    combine: (a: number, b: number) => number = (a, b) => a + b,
    defaultValue: number = 0,
  ) {
    this.combine = combine
    this.defaultValue = defaultValue
    if (Array.isArray(dataOrSize)) {
      this.size = dataOrSize.length
      this.versions = [[...dataOrSize]]
    } else {
      this.size = dataOrSize
      this.versions = [new Array(this.size).fill(defaultValue)]
    }
  }

  get initialVersion(): number {
    return 0
  }

  update(version: number, idx: number, value: number): number
  update(version: number, left: number, right: number, value: number): number
  update(version: number, arg2: number, arg3: number, arg4?: number): number {
    const source = this.versions[version]
    if (!source) throw new RangeError(`Version ${version} does not exist`)
    const newVersion = [...source]
    if (arg4 !== undefined) {
      const left = arg2
      const right = arg3
      for (let i = left; i <= right && i < this.size; i++) {
        newVersion[i] = arg4
      }
    } else {
      const idx = arg2
      if (idx < 0 || idx >= this.size) throw new RangeError(`Index ${idx} out of bounds`)
      newVersion[idx] = arg3
    }
    this.versions.push(newVersion)
    return this.versions.length - 1
  }

  query(version: number, left: number, right: number): number {
    const arr = this.versions[version]
    if (!arr) throw new RangeError(`Version ${version} does not exist`)
    let result = this.defaultValue
    let first = true
    for (let i = Math.max(0, left); i <= Math.min(right, this.size - 1); i++) {
      result = first ? arr[i]! : this.combine(result, arr[i]!)
      first = false
    }
    return result
  }

  get versionCount(): number {
    return this.versions.length
  }

  getPoint(version: number, idx: number): number {
    const arr = this.versions[version]
    if (!arr) throw new RangeError(`Version ${version} does not exist`)
    return arr[idx] ?? this.defaultValue
  }
}
