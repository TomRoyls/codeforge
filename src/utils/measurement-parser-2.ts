import { UnitConverter2 } from './unit-converter-2.js'

export interface ParsedMeasurement {
  value: number
  unit: string
  category: string
}

export class MeasurementParser2 {
  private converter: UnitConverter2
  private aliases: Map<string, { unit: string; category: string }> = new Map()
  private patterns: RegExp[] = [
    /(-?\d+\.?\d*)\s*([a-zA-Z°²³]+)/,
    /(-?\d+\.?\d*)\s*([a-zA-Z°²³/]+)/,
  ]

  constructor(converter?: UnitConverter2) {
    this.converter = converter ?? new UnitConverter2()
    this.registerAliases()
  }

  private registerAliases(): void {
    this.aliases.set('meter', { unit: 'm', category: 'length' })
    this.aliases.set('meters', { unit: 'm', category: 'length' })
    this.aliases.set('m', { unit: 'm', category: 'length' })
    this.aliases.set('kilometer', { unit: 'km', category: 'length' })
    this.aliases.set('kilometers', { unit: 'km', category: 'length' })
    this.aliases.set('km', { unit: 'km', category: 'length' })
    this.aliases.set('centimeter', { unit: 'cm', category: 'length' })
    this.aliases.set('centimeters', { unit: 'cm', category: 'length' })
    this.aliases.set('cm', { unit: 'cm', category: 'length' })
    this.aliases.set('millimeter', { unit: 'mm', category: 'length' })
    this.aliases.set('millimeters', { unit: 'mm', category: 'length' })
    this.aliases.set('mm', { unit: 'mm', category: 'length' })
    this.aliases.set('mile', { unit: 'mi', category: 'length' })
    this.aliases.set('miles', { unit: 'mi', category: 'length' })
    this.aliases.set('mi', { unit: 'mi', category: 'length' })
    this.aliases.set('foot', { unit: 'ft', category: 'length' })
    this.aliases.set('feet', { unit: 'ft', category: 'length' })
    this.aliases.set('ft', { unit: 'ft', category: 'length' })
    this.aliases.set('inch', { unit: 'in', category: 'length' })
    this.aliases.set('inches', { unit: 'in', category: 'length' })

    this.aliases.set('kg', { unit: 'kg', category: 'weight' })
    this.aliases.set('kilogram', { unit: 'kg', category: 'weight' })
    this.aliases.set('kilograms', { unit: 'kg', category: 'weight' })
    this.aliases.set('g', { unit: 'g', category: 'weight' })
    this.aliases.set('gram', { unit: 'g', category: 'weight' })
    this.aliases.set('grams', { unit: 'g', category: 'weight' })
    this.aliases.set('lb', { unit: 'lb', category: 'weight' })
    this.aliases.set('lbs', { unit: 'lb', category: 'weight' })
    this.aliases.set('pound', { unit: 'lb', category: 'weight' })
    this.aliases.set('pounds', { unit: 'lb', category: 'weight' })
    this.aliases.set('oz', { unit: 'oz', category: 'weight' })
    this.aliases.set('ounce', { unit: 'oz', category: 'weight' })
    this.aliases.set('ounces', { unit: 'oz', category: 'weight' })

    this.aliases.set('l', { unit: 'l', category: 'volume' })
    this.aliases.set('liter', { unit: 'l', category: 'volume' })
    this.aliases.set('liters', { unit: 'l', category: 'volume' })
    this.aliases.set('ml', { unit: 'ml', category: 'volume' })
    this.aliases.set('gallon', { unit: 'gal', category: 'volume' })
    this.aliases.set('gallons', { unit: 'gal', category: 'volume' })
  }

  registerAlias(alias: string, unit: string, category: string): this {
    this.aliases.set(alias.toLowerCase(), { unit, category })
    return this
  }

  parse(text: string): ParsedMeasurement | null {
    const normalized = text.trim().toLowerCase()
    for (const pattern of this.patterns) {
      const match = normalized.match(pattern)
      if (!match) continue
      const value = parseFloat(match[1])
      const rawUnit = match[2]
      const resolved = this.aliases.get(rawUnit)
      if (resolved) {
        return { value, unit: resolved.unit, category: resolved.category }
      }
      for (const category of this.converter.getCategories()) {
        if (this.converter.hasUnit(category, rawUnit)) {
          return { value, unit: rawUnit, category }
        }
      }
    }
    return null
  }

  parseAll(text: string): ParsedMeasurement[] {
    const results: ParsedMeasurement[] = []
    for (const pattern of this.patterns) {
      const globalPattern = new RegExp(pattern.source, 'g')
      let match: RegExpExecArray | null
      while ((match = globalPattern.exec(text)) !== null) {
        const value = parseFloat(match[1])
        const rawUnit = match[2]
        const resolved = this.aliases.get(rawUnit.toLowerCase())
        if (resolved) {
          results.push({ value, unit: resolved.unit, category: resolved.category })
        }
      }
      if (results.length > 0) break
    }
    return results
  }

  parseAndConvert(text: string, targetUnit: string, targetCategory: string): number | null {
    const parsed = this.parse(text)
    if (!parsed) return null
    if (parsed.category !== targetCategory) return null
    if (parsed.category === 'temperature') {
      return this.converter.convertTemperature(parsed.value, parsed.unit, targetUnit)
    }
    return this.converter.convert(parsed.value, parsed.unit, targetUnit, targetCategory)
  }

  getAliases(): string[] {
    return Array.from(this.aliases.keys())
  }

  getConverter(): UnitConverter2 {
    return this.converter
  }

  count(): number { return this.aliases.size }

  toArray(): string[] { return this.getAliases() }
  toString(): string { return JSON.stringify({ aliases: this.count() }) }
  toJSON(): Record<string, unknown> { return { aliases: this.count() } }
  clone(): MeasurementParser2 {
    const mp = new MeasurementParser2(this.converter.clone())
    this.aliases.forEach((v, k) => mp.registerAlias(k, v.unit, v.category))
    return mp
  }
  equals(other: unknown): boolean {
    if (!(other instanceof MeasurementParser2)) return false
    return this.count() === other.count()
  }
  clear(): void { this.aliases.clear(); this.registerAliases() }
}
