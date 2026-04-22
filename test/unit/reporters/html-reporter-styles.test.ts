import { describe, it, expect } from 'vitest'
import {
  SEVERITY_COLORS,
  getHTMLReporterStyles,
} from '../../../src/reporters/html-reporter-styles.js'

describe('html-reporter-styles', () => {
  describe('SEVERITY_COLORS', () => {
    it('should define color for error severity', () => {
      expect(SEVERITY_COLORS.error).toBe('#ff6b6b')
    })

    it('should define color for info severity', () => {
      expect(SEVERITY_COLORS.info).toBe('#6bcfff')
    })

    it('should define color for warning severity', () => {
      expect(SEVERITY_COLORS.warning).toBe('#ffd93d')
    })

    it('should have exactly 3 severity levels', () => {
      const keys = Object.keys(SEVERITY_COLORS)
      expect(keys).toHaveLength(3)
      expect(keys).toContain('error')
      expect(keys).toContain('info')
      expect(keys).toContain('warning')
    })

    it('should have all color values as valid hex colors', () => {
      for (const color of Object.values(SEVERITY_COLORS)) {
        expect(color).toMatch(/^#[0-9a-f]{6}$/)
      }
    })

    it('should have all values as strings', () => {
      for (const color of Object.values(SEVERITY_COLORS)) {
        expect(typeof color).toBe('string')
      }
    })

    it('should have distinct colors for error and warning', () => {
      expect(SEVERITY_COLORS.error).not.toBe(SEVERITY_COLORS.warning)
    })

    it('should have distinct colors for error and info', () => {
      expect(SEVERITY_COLORS.error).not.toBe(SEVERITY_COLORS.info)
    })

    it('should have distinct colors for warning and info', () => {
      expect(SEVERITY_COLORS.warning).not.toBe(SEVERITY_COLORS.info)
    })

    it('should have correct number of entries via Object.values', () => {
      expect(Object.values(SEVERITY_COLORS)).toHaveLength(3)
    })

    it('should have error color starting with red-like hex', () => {
      expect(SEVERITY_COLORS.error).toMatch(/^#ff/)
    })

    it('should have info color starting with blue-like hex', () => {
      expect(SEVERITY_COLORS.info).toMatch(/^#6b/)
    })

    it('should have warning color starting with yellow-like hex', () => {
      expect(SEVERITY_COLORS.warning).toMatch(/^#ff/)
    })
  })

  describe('getHTMLReporterStyles', () => {
    it('should return a non-empty string', () => {
      const styles = getHTMLReporterStyles()
      expect(styles).toBeTruthy()
      expect(typeof styles).toBe('string')
      expect(styles.length).toBeGreaterThan(0)
    })

    it('should return consistent output on multiple calls', () => {
      const first = getHTMLReporterStyles()
      const second = getHTMLReporterStyles()
      expect(first).toBe(second)
    })

    it('should return output with substantial length', () => {
      const styles = getHTMLReporterStyles()
      expect(styles.length).toBeGreaterThan(500)
    })

    it('should embed all SEVERITY_COLORS values in output', () => {
      const styles = getHTMLReporterStyles()
      expect(styles).toContain(SEVERITY_COLORS.error)
      expect(styles).toContain(SEVERITY_COLORS.info)
      expect(styles).toContain(SEVERITY_COLORS.warning)
    })

    it('should not contain template literal backticks in output', () => {
      const styles = getHTMLReporterStyles()
      expect(styles).not.toContain('`')
    })

    it('should not contain dollar-sign interpolation syntax', () => {
      const styles = getHTMLReporterStyles()
      expect(styles).not.toContain('${')
    })

    describe('CSS custom properties (:root)', () => {
      it('should define :root with CSS custom properties', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain(':root')
        expect(styles).toContain('--bg-primary')
        expect(styles).toContain('--bg-secondary')
        expect(styles).toContain('--bg-card')
        expect(styles).toContain('--text-primary')
        expect(styles).toContain('--text-secondary')
        expect(styles).toContain('--border-color')
      })

      it('should use SEVERITY_COLORS values in CSS custom properties', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain(`--error-color: ${SEVERITY_COLORS.error}`)
        expect(styles).toContain(`--warning-color: ${SEVERITY_COLORS.warning}`)
        expect(styles).toContain(`--info-color: ${SEVERITY_COLORS.info}`)
      })

      it('should define success color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('--success-color')
      })

      it('should define --bg-primary with exact value #1a1a2e', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('--bg-primary: #1a1a2e')
      })

      it('should define --bg-secondary with exact value #16213e', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('--bg-secondary: #16213e')
      })

      it('should define --bg-card with exact value #0f3460', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('--bg-card: #0f3460')
      })

      it('should define --text-primary with exact value #eaeaea', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('--text-primary: #eaeaea')
      })

      it('should define --text-secondary with exact value #a0a0a0', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('--text-secondary: #a0a0a0')
      })

      it('should define --success-color with exact value #6bcb77', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('--success-color: #6bcb77')
      })

      it('should define --border-color with exact value #2d4059', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('--border-color: #2d4059')
      })
    })

    describe('reset styles', () => {
      it('should include box-sizing reset', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('box-sizing: border-box')
        expect(styles).toContain('margin: 0')
        expect(styles).toContain('padding: 0')
      })

      it('should use universal selector for reset', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('* {')
        expect(styles).toContain('box-sizing: border-box')
      })
    })

    describe('body styles', () => {
      it('should set body font-family', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('body {')
        expect(styles).toContain('font-family:')
        expect(styles).toContain('-apple-system')
        expect(styles).toContain('BlinkMacSystemFont')
      })

      it('should use CSS custom properties for body background and color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('background: var(--bg-primary)')
        expect(styles).toContain('color: var(--text-primary)')
      })

      it('should set body padding', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('padding: 20px')
      })

      it('should set body line-height', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('line-height: 1.6')
      })

      it('should include Roboto in font stack', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('Roboto')
      })

      it('should include Oxygen in font stack', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('Oxygen')
      })

      it('should include Ubuntu in font stack', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('Ubuntu')
      })

      it('should include sans-serif fallback in font stack', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('sans-serif')
      })
    })

    describe('container styles', () => {
      it('should define .container with max-width', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.container')
        expect(styles).toContain('max-width: 1200px')
        expect(styles).toContain('margin: 0 auto')
      })
    })

    describe('header styles', () => {
      it('should define .header styles', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.header {')
        expect(styles).toContain('text-align: center')
        expect(styles).toContain('margin-bottom: 30px')
        expect(styles).toContain('border-bottom: 1px solid var(--border-color)')
      })

      it('should define .header h1 styles', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.header h1')
        expect(styles).toContain('font-size: 2rem')
      })

      it('should set header padding-bottom', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('padding-bottom: 20px')
      })

      it('should set header h1 margin-bottom', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.header h1')
        expect(styles).toContain('margin-bottom: 10px')
      })
    })

    describe('meta styles', () => {
      it('should define .meta styles', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.meta')
        expect(styles).toContain('color: var(--text-secondary)')
      })

      it('should set .meta display to flex', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.meta')
        expect(styles).toContain('display: flex')
      })

      it('should set .meta gap to 20px', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('gap: 20px')
      })

      it('should set .meta justify-content to center', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('justify-content: center')
      })

      it('should set .meta font-size', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('font-size: 0.9rem')
      })
    })

    describe('summary styles', () => {
      it('should define .summary as a grid layout', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary {')
        expect(styles).toContain('display: grid')
        expect(styles).toContain('grid-template-columns')
        expect(styles).toContain('repeat(auto-fit')
      })

      it('should define .summary-card styles', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-card {')
        expect(styles).toContain('background: var(--bg-secondary)')
        expect(styles).toContain('padding: 20px')
        expect(styles).toContain('border-radius: 8px')
        expect(styles).toContain('text-align: center')
        expect(styles).toContain('cursor: pointer')
      })

      it('should define .summary-card:hover with transform', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-card:hover')
        expect(styles).toContain('transform: translateY(-2px)')
      })

      it('should define .summary-card.has-errors border', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-card.has-errors')
        expect(styles).toContain('border-color: var(--error-color)')
      })

      it('should define .summary-card.has-warnings border', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-card.has-warnings')
        expect(styles).toContain('border-color: var(--warning-color)')
      })

      it('should define .summary-icon with severity color variants', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-icon.error')
        expect(styles).toContain('.summary-icon.warning')
        expect(styles).toContain('.summary-icon.info')
        expect(styles).toContain('.summary-icon.files')
      })

      it('should define .summary-count and .summary-label', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-count')
        expect(styles).toContain('.summary-label')
      })

      it('should set .summary gap to 15px', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary {')
        expect(styles).toContain('gap: 15px')
      })

      it('should set .summary margin-bottom', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary {')
        expect(styles).toContain('margin-bottom: 30px')
      })

      it('should use minmax in grid-template-columns', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('minmax(150px, 1fr)')
      })

      it('should define .summary-card border', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-card {')
        expect(styles).toContain('border: 1px solid var(--border-color)')
      })

      it('should define .summary-card transition', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-card {')
        expect(styles).toContain('transition: transform 0.2s, border-color 0.2s')
      })

      it('should define .summary-icon font-size', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-icon')
        expect(styles).toContain('font-size: 1.5rem')
      })

      it('should define .summary-icon error color variable', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-icon.error')
        expect(styles).toContain('color: var(--error-color)')
      })

      it('should define .summary-icon warning color variable', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-icon.warning')
        expect(styles).toContain('color: var(--warning-color)')
      })

      it('should define .summary-icon info color variable', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-icon.info')
        expect(styles).toContain('color: var(--info-color)')
      })

      it('should define .summary-count font-weight as bold', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-count')
        expect(styles).toContain('font-weight: bold')
      })

      it('should define .summary-count font-size', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-count')
        expect(styles).toContain('font-size: 2rem')
      })

      it('should define .summary-label color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-label')
        expect(styles).toContain('color: var(--text-secondary)')
      })

      it('should define .summary-label font-size', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-label')
        expect(styles).toContain('font-size: 0.9rem')
      })
    })

    describe('controls styles', () => {
      it('should define .controls layout', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.controls {')
        expect(styles).toContain('display: flex')
        expect(styles).toContain('justify-content: space-between')
      })

      it('should define .filter-btn styles', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.filter-btn {')
        expect(styles).toContain('cursor: pointer')
        expect(styles).toContain('border-radius: 4px')
      })

      it('should define .filter-btn.active state', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.filter-btn.active')
        expect(styles).toContain('border-color: var(--info-color)')
      })

      it('should define .sort select styles', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.sort select')
        expect(styles).toContain('background: var(--bg-secondary)')
        expect(styles).toContain('color: var(--text-primary)')
      })

      it('should define .actions button styles', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.actions button')
        expect(styles).toContain('cursor: pointer')
      })

      it('should set .controls align-items to center', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.controls {')
        expect(styles).toContain('align-items: center')
      })

      it('should set .controls margin-bottom', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.controls {')
        expect(styles).toContain('margin-bottom: 20px')
      })

      it('should set .controls flex-wrap', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.controls {')
        expect(styles).toContain('flex-wrap: wrap')
      })

      it('should set .controls gap', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.controls {')
        expect(styles).toContain('gap: 15px')
      })

      it('should define .filters layout', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.filters')
        expect(styles).toContain('display: flex')
        expect(styles).toContain('gap: 10px')
        expect(styles).toContain('flex-wrap: wrap')
      })

      it('should define .filter-btn background', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.filter-btn {')
        expect(styles).toContain('background: var(--bg-secondary)')
      })

      it('should define .filter-btn border', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.filter-btn {')
        expect(styles).toContain('border: 1px solid var(--border-color)')
      })

      it('should define .filter-btn color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.filter-btn {')
        expect(styles).toContain('color: var(--text-primary)')
      })

      it('should define .filter-btn padding', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.filter-btn {')
        expect(styles).toContain('padding: 8px 16px')
      })

      it('should define .filter-btn transition', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.filter-btn {')
        expect(styles).toContain('transition: all 0.2s')
      })

      it('should define .filter-btn:hover background', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.filter-btn:hover')
        expect(styles).toContain('background: var(--bg-card)')
      })

      it('should define .filter-btn.active background', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.filter-btn.active')
        expect(styles).toContain('background: var(--bg-card)')
      })

      it('should define .sort layout', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.sort')
        expect(styles).toContain('display: flex')
        expect(styles).toContain('align-items: center')
        expect(styles).toContain('gap: 10px')
      })

      it('should define .sort label color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.sort label')
        expect(styles).toContain('color: var(--text-secondary)')
      })

      it('should define .sort select padding', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.sort select')
        expect(styles).toContain('padding: 8px')
      })

      it('should define .sort select border-radius', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.sort select')
        expect(styles).toContain('border-radius: 4px')
      })

      it('should define .actions layout', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.actions')
        expect(styles).toContain('display: flex')
        expect(styles).toContain('gap: 10px')
      })

      it('should define .actions button background', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.actions button')
        expect(styles).toContain('background: var(--bg-secondary)')
      })

      it('should define .actions button border', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.actions button')
        expect(styles).toContain('border: 1px solid var(--border-color)')
      })

      it('should define .actions button color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.actions button')
        expect(styles).toContain('color: var(--text-primary)')
      })

      it('should define .actions button padding', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.actions button')
        expect(styles).toContain('padding: 8px 16px')
      })

      it('should define .actions button border-radius', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.actions button')
        expect(styles).toContain('border-radius: 4px')
      })

      it('should define .actions button transition', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.actions button')
        expect(styles).toContain('transition: background 0.2s')
      })

      it('should define .actions button:hover background', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.actions button:hover')
        expect(styles).toContain('background: var(--bg-card)')
      })
    })

    describe('results styles', () => {
      it('should define .results section', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.results')
        expect(styles).toContain('margin-bottom: 30px')
      })

      it('should define .no-results with success styling', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.no-results {')
        expect(styles).toContain('text-align: center')
        expect(styles).toContain('color: var(--success-color)')
      })

      it('should define .no-results padding', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.no-results {')
        expect(styles).toContain('padding: 60px 20px')
      })

      it('should define .no-results background', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.no-results {')
        expect(styles).toContain('background: var(--bg-secondary)')
      })

      it('should define .no-results border-radius', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.no-results {')
        expect(styles).toContain('border-radius: 8px')
      })

      it('should define .no-results font-size', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.no-results {')
        expect(styles).toContain('font-size: 1.2rem')
      })

      it('should define .success-icon font-size', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.success-icon')
        expect(styles).toContain('font-size: 3rem')
      })

      it('should define .success-icon display and margin', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.success-icon')
        expect(styles).toContain('display: block')
        expect(styles).toContain('margin-bottom: 10px')
      })

      it('should define .no-results h2 margin-bottom', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.no-results h2')
        expect(styles).toContain('margin-bottom: 10px')
      })

      it('should define .no-results p color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.no-results p')
        expect(styles).toContain('color: var(--text-secondary)')
      })
    })

    describe('file section styles', () => {
      it('should define .file-section styles', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-section {')
        expect(styles).toContain('border-radius: 8px')
        expect(styles).toContain('overflow: hidden')
      })

      it('should define .file-header styles', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-header {')
        expect(styles).toContain('cursor: pointer')
        expect(styles).toContain('background: var(--bg-card)')
      })

      it('should define .file-header::-webkit-details-marker to hide marker', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-header::-webkit-details-marker')
        expect(styles).toContain('display: none')
      })

      it('should define .toggle-icon rotation for open/closed states', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.toggle-icon')
        expect(styles).toContain('transition: transform 0.2s')
        expect(styles).toContain('.file-section[open] .toggle-icon')
        expect(styles).toContain('.file-section:not([open]) .toggle-icon')
        expect(styles).toContain('rotate(-90deg)')
      })

      it('should define .file-path with monospace font', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-path')
        expect(styles).toContain("font-family: 'SF Mono'")
        expect(styles).toContain('Monaco')
        expect(styles).toContain('monospace')
      })

      it('should define .file-badges layout', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-badges')
      })

      it('should define .file-section background', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-section {')
        expect(styles).toContain('background: var(--bg-secondary)')
      })

      it('should define .file-section margin-bottom', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-section {')
        expect(styles).toContain('margin-bottom: 15px')
      })

      it('should define .file-section border', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-section {')
        expect(styles).toContain('border: 1px solid var(--border-color)')
      })

      it('should define .file-header display as flex', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-header {')
        expect(styles).toContain('display: flex')
      })

      it('should define .file-header align-items', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-header {')
        expect(styles).toContain('align-items: center')
      })

      it('should define .file-header gap', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-header {')
        expect(styles).toContain('gap: 10px')
      })

      it('should define .file-header padding', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-header {')
        expect(styles).toContain('padding: 15px 20px')
      })

      it('should define .file-header list-style as none', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-header {')
        expect(styles).toContain('list-style: none')
      })

      it('should define .toggle-icon font-size', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.toggle-icon')
        expect(styles).toContain('font-size: 0.8rem')
      })

      it('should define .file-section[open] .toggle-icon rotate(0deg)', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-section[open] .toggle-icon')
        expect(styles).toContain('transform: rotate(0deg)')
      })

      it('should define .file-path font-weight', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-path')
        expect(styles).toContain('font-weight: 500')
      })

      it('should define .file-path flex', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-path')
        expect(styles).toContain('flex: 1')
      })

      it('should define .file-path with Cascadia Code', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-path')
        expect(styles).toContain("'Cascadia Code'")
      })

      it('should define .file-badges display and gap', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-badges')
        expect(styles).toContain('display: flex')
        expect(styles).toContain('gap: 8px')
      })
    })

    describe('badge styles', () => {
      it('should define .badge base styles', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.badge {')
        expect(styles).toContain('border-radius: 12px')
        expect(styles).toContain('font-size: 0.8rem')
        expect(styles).toContain('font-weight: 500')
      })

      it('should define .badge.error with error color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.badge.error')
        expect(styles).toContain('color: var(--error-color)')
        expect(styles).toContain('rgba(255, 107, 107, 0.2)')
      })

      it('should define .badge.warning with warning color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.badge.warning')
        expect(styles).toContain('color: var(--warning-color)')
        expect(styles).toContain('rgba(255, 217, 61, 0.2)')
      })

      it('should define .badge.info with info color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.badge.info')
        expect(styles).toContain('color: var(--info-color)')
        expect(styles).toContain('rgba(107, 207, 255, 0.2)')
      })

      it('should define .badge padding', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.badge {')
        expect(styles).toContain('padding: 2px 8px')
      })

      it('should define .badge.error background using rgba', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.badge.error')
        expect(styles).toContain('background: rgba(255, 107, 107, 0.2)')
      })

      it('should define .badge.warning background using rgba', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.badge.warning')
        expect(styles).toContain('background: rgba(255, 217, 61, 0.2)')
      })

      it('should define .badge.info background using rgba', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.badge.info')
        expect(styles).toContain('background: rgba(107, 207, 255, 0.2)')
      })
    })

    describe('violation styles', () => {
      it('should define .violation styles', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.violation {')
        expect(styles).toContain('padding: 15px 20px')
        expect(styles).toContain('border-bottom: 1px solid var(--border-color)')
      })

      it('should define .violation:last-child without border', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.violation:last-child')
        expect(styles).toContain('border-bottom: none')
      })

      it('should define .violation:hover with subtle background', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.violation:hover')
        expect(styles).toContain('rgba(255, 255, 255, 0.02)')
      })

      it('should define .violation-header as flex', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.violation-header {')
        expect(styles).toContain('display: flex')
        expect(styles).toContain('align-items: center')
      })

      it('should define .severity-icon styles with color variants', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.severity-icon.error')
        expect(styles).toContain('.severity-icon.warning')
        expect(styles).toContain('.severity-icon.info')
      })

      it('should define .location with monospace font', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.location')
        expect(styles).toContain('color: var(--text-secondary)')
        expect(styles).toContain('font-size: 0.9rem')
      })

      it('should define .rule-id styles', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.rule-id')
        expect(styles).toContain('margin-left: auto')
        expect(styles).toContain('font-size: 0.8rem')
      })

      it('should define .violation-message with left padding', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.violation-message')
        expect(styles).toContain('padding-left: 30px')
      })

      it('should define .source-code with monospace and overflow-x', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.source-code')
        expect(styles).toContain('overflow-x: auto')
        expect(styles).toContain('font-family:')
      })

      it('should define .suggestion with success color border', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.suggestion')
        expect(styles).toContain('border-left: 3px solid var(--success-color)')
        expect(styles).toContain('border-radius: 0 4px 4px 0')
      })

      it('should define .violations padding', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.violations')
        expect(styles).toContain('padding: 10px 0')
      })

      it('should define .violation transition', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.violation {')
        expect(styles).toContain('transition: background 0.2s')
      })

      it('should define .violation-header gap', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.violation-header {')
        expect(styles).toContain('gap: 10px')
      })

      it('should define .violation-header margin-bottom', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.violation-header {')
        expect(styles).toContain('margin-bottom: 8px')
      })

      it('should define .severity-icon font-size', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.severity-icon')
        expect(styles).toContain('font-size: 1rem')
      })

      it('should define .severity-icon width', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.severity-icon')
        expect(styles).toContain('width: 20px')
      })

      it('should define .severity-icon text-align', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.severity-icon')
        expect(styles).toContain('text-align: center')
      })

      it('should define .severity-icon.error color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.severity-icon.error')
        expect(styles).toContain('color: var(--error-color)')
      })

      it('should define .severity-icon.warning color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.severity-icon.warning')
        expect(styles).toContain('color: var(--warning-color)')
      })

      it('should define .severity-icon.info color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.severity-icon.info')
        expect(styles).toContain('color: var(--info-color)')
      })

      it('should define .location with monospace font-family', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.location')
        expect(styles).toContain("'SF Mono'")
        expect(styles).toContain('Monaco')
      })

      it('should define .rule-id background', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.rule-id')
        expect(styles).toContain('background: var(--bg-primary)')
      })

      it('should define .rule-id padding', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.rule-id')
        expect(styles).toContain('padding: 2px 8px')
      })

      it('should define .rule-id border-radius', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.rule-id')
        expect(styles).toContain('border-radius: 4px')
      })

      it('should define .rule-id font-family', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.rule-id')
        expect(styles).toContain('font-family: monospace')
      })

      it('should define .source-code margin', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.source-code')
        expect(styles).toContain('margin: 10px 0 10px 30px')
      })

      it('should define .source-code padding', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.source-code')
        expect(styles).toContain('padding: 10px')
      })

      it('should define .source-code background', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.source-code')
        expect(styles).toContain('background: var(--bg-primary)')
      })

      it('should define .source-code border-radius', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.source-code')
        expect(styles).toContain('border-radius: 4px')
      })

      it('should define .source-code font-size', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.source-code')
        expect(styles).toContain('font-size: 0.85rem')
      })

      it('should define .source-code with Cascadia Code', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.source-code')
        expect(styles).toContain("'Cascadia Code'")
      })

      it('should define .suggestion margin', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.suggestion')
        expect(styles).toContain('margin: 10px 0 0 30px')
      })

      it('should define .suggestion padding', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.suggestion')
        expect(styles).toContain('padding: 10px')
      })

      it('should define .suggestion background rgba', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.suggestion')
        expect(styles).toContain('rgba(107, 203, 119, 0.1)')
      })

      it('should define .suggestion font-size', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.suggestion')
        expect(styles).toContain('font-size: 0.9rem')
      })
    })

    describe('footer styles', () => {
      it('should define .footer styles', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.footer {')
        expect(styles).toContain('text-align: center')
        expect(styles).toContain('border-top: 1px solid var(--border-color)')
        expect(styles).toContain('color: var(--text-secondary)')
        expect(styles).toContain('display: flex')
        expect(styles).toContain('justify-content: space-between')
      })

      it('should define .footer padding-top', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.footer {')
        expect(styles).toContain('padding-top: 20px')
      })

      it('should define .footer font-size', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.footer {')
        expect(styles).toContain('font-size: 0.9rem')
      })
    })

    describe('utility class', () => {
      it('should define .hidden utility class', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.hidden')
        expect(styles).toContain('display: none !important')
      })
    })

    describe('additional coverage', () => {
      it('should define .summary-icon with display block and margin-bottom 5px', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain(
          '.summary-icon { font-size: 1.5rem; display: block; margin-bottom: 5px; }',
        )
      })

      it('should define .summary-count with display block', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain(
          '.summary-count { font-size: 2rem; font-weight: bold; display: block; }',
        )
      })

      it('should define .summary-icon.files with text-secondary color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-icon.files { color: var(--text-secondary); }')
      })

      it('should define .summary-label on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain(
          '.summary-label { color: var(--text-secondary); font-size: 0.9rem; }',
        )
      })

      it('should define .summary-card.has-errors on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-card.has-errors { border-color: var(--error-color); }')
      })

      it('should define .summary-card.has-warnings on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain(
          '.summary-card.has-warnings { border-color: var(--warning-color); }',
        )
      })

      it('should define .summary-card:hover on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.summary-card:hover { transform: translateY(-2px); }')
      })

      it('should define .filters on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.filters { display: flex; gap: 10px; flex-wrap: wrap; }')
      })

      it('should define .filter-btn:hover on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.filter-btn:hover { background: var(--bg-card); }')
      })

      it('should define .filter-btn.active with both background and border-color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain(
          '.filter-btn.active { background: var(--bg-card); border-color: var(--info-color); }',
        )
      })

      it('should define .sort on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.sort { display: flex; align-items: center; gap: 10px; }')
      })

      it('should define .sort label on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.sort label { color: var(--text-secondary); }')
      })

      it('should define .actions on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.actions { display: flex; gap: 10px; }')
      })

      it('should define .actions button:hover on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.actions button:hover { background: var(--bg-card); }')
      })

      it('should define .results on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.results { margin-bottom: 30px; }')
      })

      it('should define .violations on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.violations { padding: 10px 0; }')
      })

      it('should define .violation:last-child on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.violation:last-child { border-bottom: none; }')
      })

      it('should define .violation:hover on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.violation:hover { background: rgba(255, 255, 255, 0.02); }')
      })

      it('should define .violation-message on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.violation-message { padding-left: 30px; }')
      })

      it('should define .no-results h2 on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.no-results h2 { margin-bottom: 10px; }')
      })

      it('should define .no-results p on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.no-results p { color: var(--text-secondary); }')
      })

      it('should define .file-badges on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-badges { display: flex; gap: 8px; }')
      })

      it('should define .file-section[open] .toggle-icon on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.file-section[open] .toggle-icon { transform: rotate(0deg); }')
      })

      it('should define .file-section:not([open]) .toggle-icon on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain(
          '.file-section:not([open]) .toggle-icon { transform: rotate(-90deg); }',
        )
      })

      it('should define .container on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.container { max-width: 1200px; margin: 0 auto; }')
      })

      it('should define .hidden on a single line', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('.hidden { display: none !important; }')
      })

      it('should not contain @media queries', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).not.toContain('@media')
      })

      it('should contain exactly one !important declaration', () => {
        const styles = getHTMLReporterStyles()
        const importantCount = (styles.match(/!important/g) || []).length
        expect(importantCount).toBe(1)
      })

      it('should not define background in .badge base rule', () => {
        const styles = getHTMLReporterStyles()
        const badgeBase = styles.match(/\.badge \{[^}]*\}/)?.[0]
        expect(badgeBase).toBeDefined()
        expect(badgeBase).not.toContain('background')
      })

      it('should have all SEVERITY_COLORS as lowercase hex strings', () => {
        for (const color of Object.values(SEVERITY_COLORS)) {
          expect(color).toBe(color.toLowerCase())
        }
      })

      it('should have SEVERITY_COLORS with only own enumerable properties', () => {
        expect(Object.keys(SEVERITY_COLORS)).toEqual(Object.getOwnPropertyNames(SEVERITY_COLORS))
      })

      it('should define .badge.error on a single line with background and color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain(
          '.badge.error { background: rgba(255, 107, 107, 0.2); color: var(--error-color); }',
        )
      })

      it('should define .badge.warning on a single line with background and color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain(
          '.badge.warning { background: rgba(255, 217, 61, 0.2); color: var(--warning-color); }',
        )
      })

      it('should define .badge.info on a single line with background and color', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain(
          '.badge.info { background: rgba(107, 207, 255, 0.2); color: var(--info-color); }',
        )
      })
    })

    describe('CSS structural validity', () => {
      it('should contain balanced braces', () => {
        const styles = getHTMLReporterStyles()
        const openBraces = (styles.match(/{/g) || []).length
        const closeBraces = (styles.match(/}/g) || []).length
        expect(openBraces).toBe(closeBraces)
        expect(openBraces).toBeGreaterThan(0)
      })

      it('should not contain JavaScript syntax', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).not.toContain('function ')
        expect(styles).not.toContain('const ')
        expect(styles).not.toContain('let ')
        expect(styles).not.toContain('var ')
        expect(styles).not.toContain('=>')
      })

      it('should have more than 10 opening braces', () => {
        const styles = getHTMLReporterStyles()
        const openBraces = (styles.match(/{/g) || []).length
        expect(openBraces).toBeGreaterThan(10)
      })

      it('should use var() references for CSS custom properties', () => {
        const styles = getHTMLReporterStyles()
        const varCount = (styles.match(/var\(--/g) || []).length
        expect(varCount).toBeGreaterThan(0)
      })

      it('should reference all defined custom properties via var()', () => {
        const styles = getHTMLReporterStyles()
        expect(styles).toContain('var(--bg-primary)')
        expect(styles).toContain('var(--bg-secondary)')
        expect(styles).toContain('var(--bg-card)')
        expect(styles).toContain('var(--text-primary)')
        expect(styles).toContain('var(--text-secondary)')
        expect(styles).toContain('var(--border-color)')
        expect(styles).toContain('var(--error-color)')
        expect(styles).toContain('var(--warning-color)')
        expect(styles).toContain('var(--info-color)')
        expect(styles).toContain('var(--success-color)')
      })
    })
  })
})
