import { Observable2 } from './observable-2.js'

export class Subject2<T> extends Observable2<T> {
  protected observers: ((value: T) => void)[] = []
  protected errorObservers: ((error: Error) => void)[] = []
  protected completeObservers: (() => void)[] = []
  protected isCompleted = false
  protected hasError = false

  constructor() {
    super((sub) => {
      this.observers.push(sub.next)
      this.errorObservers.push(sub.error)
      this.completeObservers.push(sub.complete)
    })
  }

  next(value: T): void {
    if (this.isCompleted || this.hasError) return
    for (const obs of this.observers) {
      obs(value)
    }
  }

  error(err: Error): void {
    if (this.isCompleted || this.hasError) return
    this.hasError = true
    for (const obs of this.errorObservers) {
      obs(err)
    }
  }

  complete(): void {
    if (this.isCompleted || this.hasError) return
    this.isCompleted = true
    for (const obs of this.completeObservers) {
      obs()
    }
  }

  getObserverCount(): number {
    return this.observers.length
  }

  isDone(): boolean {
    return this.isCompleted || this.hasError
  }

  isCompletedFlag(): boolean {
    return this.isCompleted
  }

  hasErrorFlag(): boolean {
    return this.hasError
  }

  toArray(): T[] { return [] }
  toString(): string { return JSON.stringify({ observers: this.getObserverCount(), completed: this.isCompleted }) }
  toJSON(): Record<string, unknown> { return { observers: this.getObserverCount(), completed: this.isCompleted, hasError: this.hasError } }
  clone(): Subject2<T> {
    const s = new Subject2<T>()
    return s
  }
  equals(other: unknown): boolean {
    if (!(other instanceof Subject2)) return false
    return this.getObserverCount() === other.getObserverCount()
  }
  clear(): void {
    this.observers = []
    this.errorObservers = []
    this.completeObservers = []
    this.isCompleted = false
    this.hasError = false
  }
}

export class BehaviorSubject2<T> extends Subject2<T> {
  private currentValue: T

  constructor(initialValue: T) {
    super()
    this.currentValue = initialValue
    this.subscribeFn = (sub) => {
      this.observers.push(sub.next)
      this.errorObservers.push(sub.error)
      this.completeObservers.push(sub.complete)
      sub.next(this.currentValue)
    }
  }

  next(value: T): void {
    this.currentValue = value
    super.next(value)
  }

  getValue(): T {
    return this.currentValue
  }
}

export class ReplaySubject2<T> extends Subject2<T> {
  private bufferSize: number
  private buffer: T[] = []

  constructor(bufferSize: number = Infinity) {
    super()
    this.bufferSize = bufferSize
    this.subscribeFn = (sub) => {
      this.observers.push(sub.next)
      this.errorObservers.push(sub.error)
      this.completeObservers.push(sub.complete)
      for (const v of this.buffer) {
        sub.next(v)
      }
    }
  }

  next(value: T): void {
    this.buffer.push(value)
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift()
    }
    super.next(value)
  }

  getBuffer(): T[] {
    return [...this.buffer]
  }
}
