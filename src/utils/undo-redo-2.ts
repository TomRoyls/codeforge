export interface UndoAction2<T = unknown> {
  data: T
  description: string
  timestamp: number
}

export class UndoRedo2<T = unknown> {
  private undoStack: UndoAction2<T>[] = []
  private redoStack: UndoAction2<T>[] = []
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  push(data: T, description = ''): this {
    this.undoStack.push({ data, description, timestamp: Date.now() })
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift()
    }
    this.redoStack = []
    return this
  }

  undo(): UndoAction2<T> | null {
    if (this.undoStack.length === 0) return null
    const action = this.undoStack.pop()!
    this.redoStack.push(action)
    return action
  }

  redo(): UndoAction2<T> | null {
    if (this.redoStack.length === 0) return null
    const action = this.redoStack.pop()!
    this.undoStack.push(action)
    return action
  }

  canUndo(): boolean { return this.undoStack.length > 0 }
  canRedo(): boolean { return this.redoStack.length > 0 }

  peekUndo(): UndoAction2<T> | null {
    return this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1] : null
  }

  peekRedo(): UndoAction2<T> | null {
    return this.redoStack.length > 0 ? this.redoStack[this.redoStack.length - 1] : null
  }

  getUndoStack(): UndoAction2<T>[] { return [...this.undoStack] }
  getRedoStack(): UndoAction2<T>[] { return [...this.redoStack] }

  getUndoCount(): number { return this.undoStack.length }
  getRedoCount(): number { return this.redoStack.length }

  setMaxSize(size: number): this {
    this.maxSize = size
    while (this.undoStack.length > size) this.undoStack.shift()
    while (this.redoStack.length > size) this.redoStack.shift()
    return this
  }

  getMaxSize(): number { return this.maxSize }

  jumpTo(index: number): UndoAction2<T>[] {
    if (index < 0 || index >= this.undoStack.length) return []
    const popped: UndoAction2<T>[] = []
    while (this.undoStack.length > index + 1) {
      const action = this.undoStack.pop()!
      this.redoStack.push(action)
      popped.push(action)
    }
    return popped.reverse()
  }

  clearRedo(): void { this.redoStack = [] }
  clearAll(): void { this.undoStack = []; this.redoStack = [] }

  count(): number { return this.undoStack.length + this.redoStack.length }

  toArray(): UndoAction2<T>[] { return this.getUndoStack() }
  toString(): string { return JSON.stringify({ undo: this.getUndoCount(), redo: this.getRedoCount() }) }
  toJSON(): Record<string, unknown> { return { undo: this.getUndoCount(), redo: this.getRedoCount(), maxSize: this.maxSize } }
  clone(): UndoRedo2<T> {
    const ur = new UndoRedo2<T>(this.maxSize)
    ur.undoStack = [...this.undoStack]
    ur.redoStack = [...this.redoStack]
    return ur
  }
  equals(other: unknown): boolean {
    if (!(other instanceof UndoRedo2)) return false
    return this.getUndoCount() === other.getUndoCount() && this.getRedoCount() === other.getRedoCount()
  }
  clear(): void { this.clearAll() }
}
