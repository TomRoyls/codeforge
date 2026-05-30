export type Comparator<T> = (a: T, b: T) => number

export const Comparators = {
  natural<T>(): Comparator<T> {
    return (a, b) => (a as number) - (b as number)
  },

  reverse<T>(): Comparator<T> {
    return (a, b) => (b as number) - (a as number)
  },

  byKey<T, K>(keyFn: (item: T) => K, keyComp?: Comparator<K>): Comparator<T> {
    const comp = keyComp ?? ((a, b) => (a as number) - (b as number))
    return (a, b) => comp(keyFn(a), keyFn(b))
  },

  chain<T>(...comparators: Comparator<T>[]): Comparator<T> {
    return (a, b) => {
      for (const comp of comparators) {
        const result = comp(a, b)
        if (result !== 0) return result
      }
      return 0
    }
  },

  locale: <Comparator<string>>((a, b) => a.localeCompare(b)),

  localeReverse: <Comparator<string>>((a, b) => b.localeCompare(a)),

  byStringLength: <Comparator<string>>((a, b) => a.length - b.length),

  boolean(): Comparator<boolean> {
    return (a, b) => (a === b ? 0 : a ? -1 : 1)
  },

  nullish<T>(comp: Comparator<T>): Comparator<T | null | undefined> {
    return (a, b) => {
      if (a == null && b == null) return 0
      if (a == null) return 1
      if (b == null) return -1
      return comp(a, b)
    }
  },

  derived<T, U>(transform: (value: T) => U, comp: Comparator<U>): Comparator<T> {
    return (a, b) => comp(transform(a), transform(b))
  },
}
