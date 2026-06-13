export type UnitSystem = 'metric' | 'imperial'

interface ConversionFactor {
  toBase: number
}

export class UnitConverter2 {
  private conversions: Map<string, Map<string, ConversionFactor>> = new Map()

  constructor() {
    this.registerDefaults()
  }

  registerCategory(category: string): void {
    if (!this.conversions.has(category)) {
      this.conversions.set(category, new Map())
    }
  }

  registerUnit(category: string, unit: string, toBase: number): void {
    this.registerCategory(category)
    this.conversions.get(category)!.set(unit, { toBase })
  }

  convert(value: number, from: string, to: string, category: string): number {
    const cat = this.conversions.get(category)
    if (!cat) throw new Error(`Unknown category: ${category}`)
    const fromFactor = cat.get(from)
    const toFactor = cat.get(to)
    if (!fromFactor) throw new Error(`Unknown unit: ${from}`)
    if (!toFactor) throw new Error(`Unknown unit: ${to}`)
    return (value * fromFactor.toBase) / toFactor.toBase
  }

  getUnits(category: string): string[] {
    const cat = this.conversions.get(category)
    return cat ? Array.from(cat.keys()) : []
  }

  getCategories(): string[] {
    return Array.from(this.conversions.keys())
  }

  hasUnit(category: string, unit: string): boolean {
    return this.conversions.get(category)?.has(unit) ?? false
  }

  batchConvert(values: number[], from: string, to: string, category: string): number[] {
    return values.map(v => this.convert(v, from, to, category))
  }

  format(value: number, unit: string, precision = 2): string {
    return `${value.toFixed(precision)} ${unit}`
  }

  private registerDefaults(): void {
    this.registerUnit('length', 'm', 1)
    this.registerUnit('length', 'km', 1000)
    this.registerUnit('length', 'cm', 0.01)
    this.registerUnit('length', 'mm', 0.001)
    this.registerUnit('length', 'mi', 1609.344)
    this.registerUnit('length', 'ft', 0.3048)
    this.registerUnit('length', 'in', 0.0254)

    this.registerUnit('weight', 'kg', 1)
    this.registerUnit('weight', 'g', 0.001)
    this.registerUnit('weight', 'mg', 0.000001)
    this.registerUnit('weight', 'lb', 0.453592)
    this.registerUnit('weight', 'oz', 0.0283495)

    this.registerUnit('temperature', 'c', 1)
    this.registerUnit('temperature', 'f', 1)
    this.registerUnit('temperature', 'k', 1)

    this.registerUnit('volume', 'l', 1)
    this.registerUnit('volume', 'ml', 0.001)
    this.registerUnit('volume', 'gal', 3.78541)
    this.registerUnit('volume', 'qt', 0.946353)
  }

  convertTemperature(value: number, from: string, to: string): number {
    let celsius: number
    if (from === 'c') celsius = value
    else if (from === 'f') celsius = (value - 32) * 5 / 9
    else if (from === 'k') celsius = value - 273.15
    else throw new Error(`Unknown unit: ${from}`)

    if (to === 'c') return celsius
    if (to === 'f') return celsius * 9 / 5 + 32
    if (to === 'k') return celsius + 273.15
    throw new Error(`Unknown unit: ${to}`)
  }

  toArray(): string[] { return this.getCategories() }
  toString(): string { return JSON.stringify({ categories: this.getCategories().length }) }
  toJSON(): Record<string, unknown> { return { categories: this.getCategories(), units: this.getCategories().map(c => ({ category: c, units: this.getUnits(c) })) } }
  clone(): UnitConverter2 {
    const uc = new UnitConverter2()
    this.conversions.forEach((units, cat) => {
      units.forEach((factor, unit) => uc.registerUnit(cat, unit, factor.toBase))
    })
    return uc
  }
  equals(other: unknown): boolean {
    if (!(other instanceof UnitConverter2)) return false
    return this.getCategories().length === other.getCategories().length
  }
  clear(): void { this.conversions.clear(); this.registerDefaults() }
}
