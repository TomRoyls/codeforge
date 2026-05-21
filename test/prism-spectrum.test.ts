import { describe, expect, it } from 'vitest'
import {
  analyzeSpectralBand,
  analyzeSpectrumReading,
  buildPrismSpectrumResult,
  classifyPurityGrade,
  classifySpectralClass,
  classifySpectroscopistGrade,
  detectCrossContamination,
  generateRecommendations,
  measureAllConcerns,
  measureConcern,
} from '../src/commands/prism-spectrum-helpers.js'
import type { SpectrumMeasure } from '../src/commands/prism-spectrum-helpers.js'
import { formatPrismSpectrumJson, formatPrismSpectrumTable } from '../src/commands/prism-spectrum-format-helpers.js'

// ─── measureConcern ──────────────────────────────────────────────────────────

describe('measureConcern', () => {
  it('returns 0 for empty string', () => {
    expect(measureConcern('', 'business')).toBe(0)
  })

  it('detects business concerns', () => {
    const code = 'const total = items.map(i => i.price * i.quantity).reduce((a, b) => a + b, 0)'
    const score = measureConcern(code, 'business')
    expect(score).toBeGreaterThan(0)
  })

  it('detects data access concerns', () => {
    const code = 'const users = await db.query("SELECT * FROM users")'
    const score = measureConcern(code, 'dataAccess')
    expect(score).toBeGreaterThan(0)
  })

  it('detects presentation concerns', () => {
    const code = 'console.log("Hello world")'
    const score = measureConcern(code, 'presentation')
    expect(score).toBeGreaterThan(0)
  })

  it('detects validation concerns', () => {
    const code = 'if (age === 18) { validate(input) }'
    const score = measureConcern(code, 'validation')
    expect(score).toBeGreaterThan(0)
  })

  it('detects error handling concerns', () => {
    const code = 'try { doWork() } catch (e) { throw new Error("fail") }'
    const score = measureConcern(code, 'errorHandling')
    expect(score).toBeGreaterThan(0)
  })

  it('detects logging concerns', () => {
    const code = 'console.log("debug")'
    const score = measureConcern(code, 'logging')
    expect(score).toBeGreaterThan(0)
  })

  it('detects configuration concerns', () => {
    const code = 'const host = process.env.HOST'
    const score = measureConcern(code, 'configuration')
    expect(score).toBeGreaterThan(0)
  })

  it('detects infrastructure concerns', () => {
    const code = 'import http from "http"'
    const score = measureConcern(code, 'infrastructure')
    expect(score).toBeGreaterThan(0)
  })

  it('detects testing concerns', () => {
    const code = 'describe("test", () => { it("works", () => { expect(1).toBe(1) }) })'
    const score = measureConcern(code, 'testing')
    expect(score).toBeGreaterThan(0)
  })

  it('detects documentation concerns', () => {
    const code = ['/** Docs */', 'function hello() {', '  // comment', '}'].join('\n')
    const score = measureConcern(code, 'documentation')
    expect(score).toBeGreaterThan(0)
  })

  it('caps score at 100', () => {
    const code = Array(50).fill('const total = items.map(i => i.price).reduce((a, b) => a + b, 0)').join('\n')
    const score = measureConcern(code, 'business')
    expect(score).toBeLessThanOrEqual(100)
  })

  it('returns 0 for irrelevant content', () => {
    const code = 'const x = 1 + 2'
    expect(measureConcern(code, 'testing')).toBe(0)
  })
})

// ─── measureAllConcerns ──────────────────────────────────────────────────────

describe('measureAllConcerns', () => {
  it('returns all 10 concern scores', () => {
    const result = measureAllConcerns('const x = 1')
    const keys = Object.keys(result)
    expect(keys).toHaveLength(10)
  })

  it('returns SpectrumMeasure with correct keys', () => {
    const result = measureAllConcerns('')
    expect(result).toHaveProperty('business')
    expect(result).toHaveProperty('dataAccess')
    expect(result).toHaveProperty('presentation')
    expect(result).toHaveProperty('validation')
    expect(result).toHaveProperty('errorHandling')
    expect(result).toHaveProperty('logging')
    expect(result).toHaveProperty('configuration')
    expect(result).toHaveProperty('infrastructure')
    expect(result).toHaveProperty('testing')
    expect(result).toHaveProperty('documentation')
  })

  it('returns 0 for all concerns on empty string', () => {
    const result = measureAllConcerns('')
    for (const v of Object.values(result)) {
      expect(v).toBe(0)
    }
  })

  it('detects multiple concerns simultaneously', () => {
    const code = [
      'import http from "http"',
      'try {',
      '  const data = await fetch(url)',
      '  console.log(data)',
      '  if (data.status === 200) { validate(data) }',
      '} catch (e) { throw new Error("fail") }',
    ].join('\n')
    const result = measureAllConcerns(code)
    const nonzero = Object.values(result).filter(v => v > 0)
    expect(nonzero.length).toBeGreaterThanOrEqual(3)
  })
})

// ─── classifySpectralClass ───────────────────────────────────────────────────

describe('classifySpectralClass', () => {
  it('returns ultraviolet for peak >= 90', () => {
    expect(classifySpectralClass(95)).toBe('ultraviolet')
    expect(classifySpectralClass(90)).toBe('ultraviolet')
  })

  it('returns violet for peak 80-89', () => {
    expect(classifySpectralClass(85)).toBe('violet')
    expect(classifySpectralClass(80)).toBe('violet')
  })

  it('returns blue for peak 70-79', () => {
    expect(classifySpectralClass(75)).toBe('blue')
  })

  it('returns cyan for peak 60-69', () => {
    expect(classifySpectralClass(65)).toBe('cyan')
  })

  it('returns green for peak 50-59', () => {
    expect(classifySpectralClass(55)).toBe('green')
  })

  it('returns yellow for peak 40-49', () => {
    expect(classifySpectralClass(45)).toBe('yellow')
  })

  it('returns orange for peak 30-39', () => {
    expect(classifySpectralClass(35)).toBe('orange')
  })

  it('returns red for peak 20-29', () => {
    expect(classifySpectralClass(25)).toBe('red')
  })

  it('returns infrared for peak 10-19', () => {
    expect(classifySpectralClass(15)).toBe('infrared')
  })

  it('returns white-light for peak < 10', () => {
    expect(classifySpectralClass(5)).toBe('white-light')
    expect(classifySpectralClass(0)).toBe('white-light')
  })
})

// ─── classifyPurityGrade ─────────────────────────────────────────────────────

describe('classifyPurityGrade', () => {
  it('returns monochromatic for 1 or fewer concerns', () => {
    expect(classifyPurityGrade(90, 1)).toBe('monochromatic')
    expect(classifyPurityGrade(10, 0)).toBe('monochromatic')
  })

  it('returns narrow-band for high purity and 2 concerns', () => {
    expect(classifyPurityGrade(80, 2)).toBe('narrow-band')
  })

  it('returns broad-band for medium purity and 3 concerns', () => {
    expect(classifyPurityGrade(60, 3)).toBe('broad-band')
  })

  it('returns wide-band for lower purity and 4-5 concerns', () => {
    expect(classifyPurityGrade(30, 4)).toBe('wide-band')
    expect(classifyPurityGrade(50, 5)).toBe('wide-band')
  })

  it('returns white-noise for 7+ concerns', () => {
    expect(classifyPurityGrade(50, 7)).toBe('white-noise')
    expect(classifyPurityGrade(90, 10)).toBe('white-noise')
  })

  it('returns full-spectrum as fallback', () => {
    expect(classifyPurityGrade(20, 6)).toBe('full-spectrum')
  })
})

// ─── classifySpectroscopistGrade ─────────────────────────────────────────────

describe('classifySpectroscopistGrade', () => {
  it('returns master-optician for avgPurity >= 80', () => {
    expect(classifySpectroscopistGrade(85)).toBe('master-optician')
  })

  it('returns optician for avgPurity 65-79', () => {
    expect(classifySpectroscopistGrade(70)).toBe('optician')
  })

  it('returns physicist for avgPurity 45-64', () => {
    expect(classifySpectroscopistGrade(50)).toBe('physicist')
  })

  it('returns student for avgPurity 25-44', () => {
    expect(classifySpectroscopistGrade(30)).toBe('student')
  })

  it('returns colorblind for avgPurity 10-24', () => {
    expect(classifySpectroscopistGrade(15)).toBe('colorblind')
  })

  it('returns blind for avgPurity < 10', () => {
    expect(classifySpectroscopistGrade(5)).toBe('blind')
    expect(classifySpectroscopistGrade(0)).toBe('blind')
  })
})

// ─── detectCrossContamination ────────────────────────────────────────────────

describe('detectCrossContamination', () => {
  it('returns all zeros when no concerns exceed threshold', () => {
    const spectrum: SpectrumMeasure = {
      business: 10, dataAccess: 10, presentation: 10, validation: 10,
      errorHandling: 10, logging: 10, configuration: 10, infrastructure: 10,
      testing: 10, documentation: 10,
    }
    const result = detectCrossContamination(spectrum)
    expect(result.businessInData).toBe(0)
    expect(result.dataInPresentation).toBe(0)
    expect(result.presentationInBusiness).toBe(0)
    expect(result.infrastructureInBusiness).toBe(0)
    expect(result.totalCrossContamination).toBe(0)
  })

  it('detects business in data contamination', () => {
    const spectrum: SpectrumMeasure = {
      business: 50, dataAccess: 50, presentation: 0, validation: 0,
      errorHandling: 0, logging: 0, configuration: 0, infrastructure: 0,
      testing: 0, documentation: 0,
    }
    const result = detectCrossContamination(spectrum)
    expect(result.businessInData).toBeGreaterThan(0)
  })

  it('detects data in presentation contamination', () => {
    const spectrum: SpectrumMeasure = {
      business: 0, dataAccess: 50, presentation: 50, validation: 0,
      errorHandling: 0, logging: 0, configuration: 0, infrastructure: 0,
      testing: 0, documentation: 0,
    }
    const result = detectCrossContamination(spectrum)
    expect(result.dataInPresentation).toBeGreaterThan(0)
  })

  it('detects presentation in business contamination', () => {
    const spectrum: SpectrumMeasure = {
      business: 50, dataAccess: 0, presentation: 50, validation: 0,
      errorHandling: 0, logging: 0, configuration: 0, infrastructure: 0,
      testing: 0, documentation: 0,
    }
    const result = detectCrossContamination(spectrum)
    expect(result.presentationInBusiness).toBeGreaterThan(0)
  })

  it('detects infrastructure in business contamination', () => {
    const spectrum: SpectrumMeasure = {
      business: 50, dataAccess: 0, presentation: 0, validation: 0,
      errorHandling: 0, logging: 0, configuration: 0, infrastructure: 50,
      testing: 0, documentation: 0,
    }
    const result = detectCrossContamination(spectrum)
    expect(result.infrastructureInBusiness).toBeGreaterThan(0)
  })

  it('sums total cross contamination', () => {
    const spectrum: SpectrumMeasure = {
      business: 50, dataAccess: 50, presentation: 50, validation: 0,
      errorHandling: 0, logging: 0, configuration: 0, infrastructure: 50,
      testing: 0, documentation: 0,
    }
    const result = detectCrossContamination(spectrum)
    expect(result.totalCrossContamination).toBe(
      result.businessInData + result.dataInPresentation +
      result.presentationInBusiness + result.infrastructureInBusiness,
    )
  })
})

// ─── analyzeSpectralBand ─────────────────────────────────────────────────────

describe('analyzeSpectralBand', () => {
  it('returns a valid SpectralBand', () => {
    const band = analyzeSpectralBand('const x = 1', 'test.ts')
    expect(band.file).toBe('test.ts')
    expect(band.spectrum).toBeDefined()
    expect(typeof band.spectralPurity).toBe('number')
    expect(typeof band.bandwidth).toBe('number')
    expect(typeof band.overlap).toBe('number')
    expect(typeof band.dispersion).toBe('number')
    expect(typeof band.peakIntensity).toBe('number')
    expect(typeof band.concernCount).toBe('number')
    expect(typeof band.qualityScore).toBe('number')
  })

  it('identifies monochromatic files with single concern', () => {
    const code = 'console.log("hello world")'
    const band = analyzeSpectralBand(code, 'log.ts')
    expect(band.isMonochromatic).toBe(true)
    expect(band.concernCount).toBeLessThanOrEqual(1)
  })

  it('identifies files with many concerns as polychromatic or white-light', () => {
    const code = [
      'import http from "http"',
      'const price = items.map(i => i.price).reduce((a, b) => a + b, 0)',
      'console.log(price)',
      'try { fetch(url) } catch (e) { throw new Error("fail") }',
      'if (age === 18) { validate(input) }',
      'const host = process.env.HOST',
    ].join('\n')
    const band = analyzeSpectralBand(code, 'mixed.ts')
    expect(band.concernCount).toBeGreaterThanOrEqual(3)
    expect(band.isPolychromatic || band.isWhiteLight).toBe(true)
  })

  it('computes dominantConcerns from top concerns', () => {
    const code = 'console.log("hello")'
    const band = analyzeSpectralBand(code, 'test.ts')
    expect(band.dominantConcerns).toBeDefined()
    expect(band.dominantConcerns.length).toBeLessThanOrEqual(3)
  })

  it('computes crossContamination', () => {
    const band = analyzeSpectralBand('console.log("hello")', 'test.ts')
    expect(band.crossContamination).toBeDefined()
    expect(typeof band.crossContamination.totalCrossContamination).toBe('number')
  })

  it('sets spectralClass based on peakIntensity', () => {
    const band = analyzeSpectralBand('', 'empty.ts')
    expect(band.spectralClass).toBe('white-light')
  })

  it('sets purityGrade based on concernCount and purity', () => {
    const band = analyzeSpectralBand('const x = 1', 'simple.ts')
    expect(['monochromatic', 'narrow-band', 'broad-band', 'wide-band', 'full-spectrum', 'white-noise']).toContain(band.purityGrade)
  })

  it('handles empty content', () => {
    const band = analyzeSpectralBand('', 'empty.ts')
    expect(band.file).toBe('empty.ts')
    expect(band.concernCount).toBe(0)
    expect(band.isMonochromatic).toBe(true)
  })
})

// ─── analyzeSpectrumReading ──────────────────────────────────────────────────

describe('analyzeSpectrumReading', () => {
  it('returns empty reading for no bands', () => {
    const reading = analyzeSpectrumReading([], 'empty-dir')
    expect(reading.directory).toBe('empty-dir')
    expect(reading.bands).toHaveLength(0)
    expect(reading.avgPurity).toBe(0)
    expect(reading.spectrumHealth).toBe('white-noise')
    expect(reading.reading).toBe('Empty spectrum')
  })

  it('computes averages from bands', () => {
    const code = 'import http from "http"\nconst total = items.map(i => i.price).reduce((a, b) => a + b, 0)'
    const bands = [
      analyzeSpectralBand(code, 'a.ts'),
      analyzeSpectralBand(code, 'b.ts'),
    ]
    const reading = analyzeSpectrumReading(bands, 'src')
    expect(reading.directory).toBe('src')
    expect(reading.bands).toHaveLength(2)
    expect(reading.avgPurity).toBeGreaterThanOrEqual(0)
    expect(reading.avgOverlap).toBeGreaterThanOrEqual(0)
  })

  it('counts monochromatic and whiteLight files', () => {
    const monoBand = analyzeSpectralBand('const x = 1', 'mono.ts')
    const bands = [monoBand]
    const reading = analyzeSpectrumReading(bands, 'src')
    expect(reading.monochromaticCount).toBeGreaterThanOrEqual(0)
    expect(reading.whiteLightCount).toBeGreaterThanOrEqual(0)
  })

  it('determines spectrumHealth', () => {
    const bands = [analyzeSpectralBand('const x = 1', 'simple.ts')]
    const reading = analyzeSpectrumReading(bands, 'src')
    expect(['clean-rainbow', 'clear', 'hazy', 'muddy', 'chaotic', 'white-noise']).toContain(reading.spectrumHealth)
  })

  it('computes separationQuality', () => {
    const bands = [analyzeSpectralBand('const x = 1', 'simple.ts')]
    const reading = analyzeSpectrumReading(bands, 'src')
    expect(reading.separationQuality).toBeGreaterThanOrEqual(0)
    expect(reading.separationQuality).toBeLessThanOrEqual(100)
  })

  it('computes hasClearSeparation', () => {
    const bands = [analyzeSpectralBand('const x = 1', 'simple.ts')]
    const reading = analyzeSpectrumReading(bands, 'src')
    expect(typeof reading.hasClearSeparation).toBe('boolean')
  })

  it('computes concernDistribution', () => {
    const bands = [analyzeSpectralBand('const x = 1', 'simple.ts')]
    const reading = analyzeSpectrumReading(bands, 'src')
    expect(reading.concernDistribution).toBeDefined()
    expect(typeof reading.concernDistribution).toBe('object')
  })

  it('generates reading string', () => {
    const bands = [analyzeSpectralBand('const x = 1', 'simple.ts')]
    const reading = analyzeSpectrumReading(bands, 'src')
    expect(reading.reading).toContain('Spectrum:')
    expect(reading.reading).toContain('purity:')
  })
})

// ─── generateRecommendations ─────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns recommendations for white-light files', () => {
    const stats = {
      totalFiles: 5, totalReadings: 1, avgSpectralPurity: 50, avgBandwidth: 40,
      avgOverlap: 30, avgDispersion: 20, monochromaticFiles: 1, narrowBandFiles: 1,
      broadBandFiles: 1, whiteLightFiles: 2, whiteNoiseFiles: 0, businessFiles: 1,
      dataAccessFiles: 1, presentationFiles: 1, validationFiles: 0,
      errorHandlingFiles: 0, totalCrossContamination: 0, overallSeparation: 50,
      dominantConcern: 'business', spectroscopistGrade: 'physicist' as const,
      purestFile: 'a.ts', mostContaminated: 'b.ts', mostMonochromatic: 'c.ts',
      mostWhiteLight: 'd.ts', cleanestReading: 'src', dirtiestReading: 'src',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('White-light'))).toBe(true)
  })

  it('returns recommendations for high cross-contamination', () => {
    const stats = {
      totalFiles: 5, totalReadings: 1, avgSpectralPurity: 50, avgBandwidth: 40,
      avgOverlap: 30, avgDispersion: 20, monochromaticFiles: 1, narrowBandFiles: 1,
      broadBandFiles: 1, whiteLightFiles: 0, whiteNoiseFiles: 0, businessFiles: 1,
      dataAccessFiles: 1, presentationFiles: 1, validationFiles: 0,
      errorHandlingFiles: 0, totalCrossContamination: 50, overallSeparation: 50,
      dominantConcern: 'business', spectroscopistGrade: 'physicist' as const,
      purestFile: 'a.ts', mostContaminated: 'b.ts', mostMonochromatic: 'c.ts',
      mostWhiteLight: 'd.ts', cleanestReading: 'src', dirtiestReading: 'src',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('cross-contamination'))).toBe(true)
  })

  it('returns recommendations for high overlap', () => {
    const stats = {
      totalFiles: 5, totalReadings: 1, avgSpectralPurity: 50, avgBandwidth: 40,
      avgOverlap: 60, avgDispersion: 20, monochromaticFiles: 1, narrowBandFiles: 1,
      broadBandFiles: 1, whiteLightFiles: 0, whiteNoiseFiles: 0, businessFiles: 1,
      dataAccessFiles: 1, presentationFiles: 1, validationFiles: 0,
      errorHandlingFiles: 0, totalCrossContamination: 0, overallSeparation: 50,
      dominantConcern: 'business', spectroscopistGrade: 'physicist' as const,
      purestFile: 'a.ts', mostContaminated: 'none', mostMonochromatic: 'c.ts',
      mostWhiteLight: 'd.ts', cleanestReading: 'src', dirtiestReading: 'src',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('overlap'))).toBe(true)
  })

  it('returns recommendations for missing error handling', () => {
    const stats = {
      totalFiles: 5, totalReadings: 1, avgSpectralPurity: 50, avgBandwidth: 40,
      avgOverlap: 30, avgDispersion: 20, monochromaticFiles: 1, narrowBandFiles: 1,
      broadBandFiles: 1, whiteLightFiles: 0, whiteNoiseFiles: 0, businessFiles: 1,
      dataAccessFiles: 1, presentationFiles: 1, validationFiles: 0,
      errorHandlingFiles: 0, totalCrossContamination: 0, overallSeparation: 50,
      dominantConcern: 'business', spectroscopistGrade: 'physicist' as const,
      purestFile: 'a.ts', mostContaminated: 'none', mostMonochromatic: 'c.ts',
      mostWhiteLight: 'd.ts', cleanestReading: 'src', dirtiestReading: 'src',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('error handling'))).toBe(true)
  })

  it('returns recommendations for missing validation', () => {
    const stats = {
      totalFiles: 5, totalReadings: 1, avgSpectralPurity: 50, avgBandwidth: 40,
      avgOverlap: 30, avgDispersion: 20, monochromaticFiles: 1, narrowBandFiles: 1,
      broadBandFiles: 1, whiteLightFiles: 0, whiteNoiseFiles: 0, businessFiles: 1,
      dataAccessFiles: 1, presentationFiles: 1, validationFiles: 0,
      errorHandlingFiles: 1, totalCrossContamination: 0, overallSeparation: 50,
      dominantConcern: 'business', spectroscopistGrade: 'physicist' as const,
      purestFile: 'a.ts', mostContaminated: 'none', mostMonochromatic: 'c.ts',
      mostWhiteLight: 'd.ts', cleanestReading: 'src', dirtiestReading: 'src',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('validation'))).toBe(true)
  })

  it('recommends good separation for high separation scores', () => {
    const stats = {
      totalFiles: 5, totalReadings: 1, avgSpectralPurity: 50, avgBandwidth: 40,
      avgOverlap: 10, avgDispersion: 20, monochromaticFiles: 1, narrowBandFiles: 1,
      broadBandFiles: 1, whiteLightFiles: 0, whiteNoiseFiles: 0, businessFiles: 1,
      dataAccessFiles: 1, presentationFiles: 1, validationFiles: 1,
      errorHandlingFiles: 1, totalCrossContamination: 0, overallSeparation: 75,
      dominantConcern: 'business', spectroscopistGrade: 'optician' as const,
      purestFile: 'a.ts', mostContaminated: 'none', mostMonochromatic: 'c.ts',
      mostWhiteLight: 'd.ts', cleanestReading: 'src', dirtiestReading: 'src',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('Good separation'))).toBe(true)
  })

  it('returns recommendations for muddy spectrums', () => {
    const bands = [analyzeSpectralBand('const x = 1', 'a.ts')]
    const muddyReading = { ...analyzeSpectrumReading(bands, 'src'), spectrumHealth: 'muddy' as const }
    const stats = {
      totalFiles: 1, totalReadings: 1, avgSpectralPurity: 50, avgBandwidth: 40,
      avgOverlap: 30, avgDispersion: 20, monochromaticFiles: 1, narrowBandFiles: 0,
      broadBandFiles: 0, whiteLightFiles: 0, whiteNoiseFiles: 0, businessFiles: 0,
      dataAccessFiles: 0, presentationFiles: 0, validationFiles: 0,
      errorHandlingFiles: 0, totalCrossContamination: 0, overallSeparation: 50,
      dominantConcern: 'none', spectroscopistGrade: 'physicist' as const,
      purestFile: 'a.ts', mostContaminated: 'none', mostMonochromatic: 'a.ts',
      mostWhiteLight: 'a.ts', cleanestReading: 'src', dirtiestReading: 'src',
    }
    const recs = generateRecommendations(bands, [muddyReading], stats)
    expect(recs.some(r => r.includes('Muddy'))).toBe(true)
  })

  it('deduplicates recommendations', () => {
    const stats = {
      totalFiles: 5, totalReadings: 1, avgSpectralPurity: 50, avgBandwidth: 40,
      avgOverlap: 30, avgDispersion: 20, monochromaticFiles: 1, narrowBandFiles: 1,
      broadBandFiles: 1, whiteLightFiles: 0, whiteNoiseFiles: 0, businessFiles: 1,
      dataAccessFiles: 1, presentationFiles: 1, validationFiles: 0,
      errorHandlingFiles: 0, totalCrossContamination: 0, overallSeparation: 50,
      dominantConcern: 'business', spectroscopistGrade: 'physicist' as const,
      purestFile: 'a.ts', mostContaminated: 'none', mostMonochromatic: 'c.ts',
      mostWhiteLight: 'd.ts', cleanestReading: 'src', dirtiestReading: 'src',
    }
    const recs = generateRecommendations([], [], stats)
    const unique = Array.from(new Set(recs))
    expect(recs).toHaveLength(unique.length)
  })
})

// ─── buildPrismSpectrumResult ────────────────────────────────────────────────

describe('buildPrismSpectrumResult', () => {
  it('returns valid result for empty input', () => {
    const result = buildPrismSpectrumResult([], [], {})
    expect(result.bands).toHaveLength(0)
    expect(result.readings).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.fullSpectrum.totalConcerns).toBe(0)
  })

  it('analyzes a single file', () => {
    const result = buildPrismSpectrumResult(
      ['test.ts'],
      ['const x = 1 + 2'],
      {},
    )
    expect(result.bands).toHaveLength(1)
    expect(result.bands[0].file).toBe('test.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into readings', () => {
    const result = buildPrismSpectrumResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['const x = 1', 'const y = 2', 'const z = 3'],
      {},
    )
    expect(result.bands).toHaveLength(3)
    expect(result.readings).toHaveLength(2)
  })

  it('computes fullSpectrum aggregates', () => {
    const result = buildPrismSpectrumResult(
      ['a.ts', 'b.ts'],
      ['const x = 1', 'const y = 2'],
      {},
    )
    expect(result.fullSpectrum.avgPurity).toBeGreaterThanOrEqual(0)
    expect(result.fullSpectrum.avgOverlap).toBeGreaterThanOrEqual(0)
    expect(result.fullSpectrum.avgDispersion).toBeGreaterThanOrEqual(0)
    expect(typeof result.fullSpectrum.isWellSeparated).toBe('boolean')
  })

  it('computes stats with correct fields', () => {
    const result = buildPrismSpectrumResult(
      ['a.ts'],
      ['const x = 1'],
      {},
    )
    const s = result.stats
    expect(s.totalFiles).toBe(1)
    expect(s.totalReadings).toBeGreaterThanOrEqual(1)
    expect(typeof s.avgSpectralPurity).toBe('number')
    expect(typeof s.avgBandwidth).toBe('number')
    expect(typeof s.spectroscopistGrade).toBe('string')
    expect(s.purestFile).toBe('a.ts')
  })

  it('generates recommendations', () => {
    const result = buildPrismSpectrumResult(
      ['a.ts'],
      ['const x = 1'],
      {},
    )
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('handles multiple files with mixed concerns', () => {
    const result = buildPrismSpectrumResult(
      ['business.ts', 'db.ts', 'ui.ts'],
      [
        'const total = items.map(i => i.price).reduce((a, b) => a + b, 0)',
        'const users = await db.query("SELECT * FROM users")',
        'console.log("Hello world")',
      ],
      {},
    )
    expect(result.bands).toHaveLength(3)
    expect(result.stats.businessFiles).toBeGreaterThanOrEqual(0)
    expect(result.stats.dataAccessFiles).toBeGreaterThanOrEqual(0)
    expect(result.stats.presentationFiles).toBeGreaterThanOrEqual(0)
  })

  it('handles file with no slash as root directory', () => {
    const result = buildPrismSpectrumResult(
      ['simple.ts'],
      ['const x = 1'],
      {},
    )
    expect(result.readings.length).toBeGreaterThanOrEqual(1)
    expect(result.readings.some(r => r.directory === '.')).toBe(true)
  })

  it('uses void options', () => {
    const result = buildPrismSpectrumResult(['a.ts'], ['x'], { foo: 'bar' })
    expect(result.bands).toHaveLength(1)
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('formatPrismSpectrumTable', () => {
  it('returns a string', () => {
    const result = buildPrismSpectrumResult([], [], {})
    const formatted = formatPrismSpectrumTable(result, false)
    expect(typeof formatted).toBe('string')
  })

  it('includes spectrum header', () => {
    const result = buildPrismSpectrumResult([], [], {})
    const formatted = formatPrismSpectrumTable(result, false)
    expect(formatted).toContain('Prism Spectrum')
  })

  it('shows bands when present', () => {
    const result = buildPrismSpectrumResult(
      ['test.ts'],
      ['const x = 1'],
      {},
    )
    const formatted = formatPrismSpectrumTable(result, false)
    expect(formatted).toContain('test.ts')
  })

  it('shows verbose details when enabled', () => {
    const result = buildPrismSpectrumResult(
      ['test.ts'],
      ['const x = 1'],
      {},
    )
    const short = formatPrismSpectrumTable(result, false)
    const detailed = formatPrismSpectrumTable(result, true)
    expect(detailed.length).toBeGreaterThanOrEqual(short.length)
  })

  it('truncates bands in non-verbose mode', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => 'const x = 1')
    const result = buildPrismSpectrumResult(files, contents, {})
    const formatted = formatPrismSpectrumTable(result, false)
    expect(formatted).toContain('more')
  })
})

describe('formatPrismSpectrumJson', () => {
  it('returns valid JSON', () => {
    const result = buildPrismSpectrumResult(['a.ts'], ['const x = 1'], {})
    const json = formatPrismSpectrumJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('contains bands array', () => {
    const result = buildPrismSpectrumResult(['a.ts'], ['const x = 1'], {})
    const parsed = JSON.parse(formatPrismSpectrumJson(result))
    expect(parsed.bands).toHaveLength(1)
  })

  it('contains fullSpectrum', () => {
    const result = buildPrismSpectrumResult(['a.ts'], ['const x = 1'], {})
    const parsed = JSON.parse(formatPrismSpectrumJson(result))
    expect(parsed.fullSpectrum).toBeDefined()
  })

  it('contains stats', () => {
    const result = buildPrismSpectrumResult(['a.ts'], ['const x = 1'], {})
    const parsed = JSON.parse(formatPrismSpectrumJson(result))
    expect(parsed.stats).toBeDefined()
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
