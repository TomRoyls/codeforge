import * as fs from 'fs/promises';
import * as path from 'path';
import type { RuleViolation } from '../ast/visitor.js';

export type OutputFormat = 'console' | 'html' | 'json' | 'junit' | 'sarif' | 'markdown' | 'gitlab';

export interface ReporterOptions {
  format: OutputFormat;
  verbose: boolean;
  quiet: boolean;
  outputPath?: string;
}

export interface FileReport {
  filePath: string;
  violations: RuleViolation[];
}

export interface AnalysisReport {
  files: FileReport[];
  summary: {
    totalFiles: number;
    totalViolations: number;
    errors: number;
    warnings: number;
    info: number;
    duration: number;
  };
}

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

export class Reporter {
  private options: ReporterOptions;

  constructor(options: ReporterOptions) {
    this.options = options;
  }

  formatReport(report: AnalysisReport): string {
    switch (this.options.format) {
      case 'json':
        return this.formatJson(report);
      case 'html':
        return this.formatHtml(report);
      case 'junit':
        return this.formatJunit(report);
      case 'sarif':
      case 'markdown':
        return this.formatMarkdown(report);
      case 'gitlab':
        return this.formatGitlab(report);
        return this.formatSarif(report);
      case 'console':
      default:
        return this.formatConsole(report);
    }
  }

  private formatJunit(report: AnalysisReport): string {
    const lines: string[] = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<testsuit name="codeforge-analysis" tests="1" errors="0" failures="0" skipped="0">');
    lines.push(`  <properties>`);
    lines.push('    <property name="files-analyzed" value="1" />');
    lines.push(`  </properties>`);
    
    for (const file of report.files) {
      if (file.violations.length === 0) continue;
      lines.push('  <testsuite name="' + file.filePath + '" tests="' + file.violations.length + '">');
      lines.push('    <properties>');
      for (const violation of file.violations) {
        const testcase = this.formatTestCase(violation);
        lines.push(`      ${testcase}`);
      }
      lines.push('  </testsuite>');
    }
    
    lines.push('</testsuit>');
    return lines.join('\n');
  }

  private formatTestCase(violation: RuleViolation): string {
    const location = `${violation.filePath}:${violation.range.start.line}:${violation.range.start.column}`;
    const message = this.escapeXml(violation.message);
    const ruleId = this.escapeXml(violation.ruleId);
    
    return `<testcase name="${ruleId}: ${message}" classname="${violation.ruleId}">
      <failure message="${location}">${message}</failure>
    </testcase>`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private formatSarif(report: AnalysisReport): string {
    const sarifLog = {
      $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      version: '2.1.0',
      runs: [{
        tool: {
          driver: {
            name: 'CodeForge',
            version: '0.1.0',
            informationUri: 'https://github.com/codeforge-dev/codeforge',
            rules: this.extractSarifRules(report),
          },
        },
        results: this.extractSarifResults(report),
      }],
    };
    return JSON.stringify(sarifLog, null, 2);
  }

  private extractSarifRules(report: AnalysisReport): unknown[] {
    const rulesMap = new Map<string, { id: string; shortDescription: string }>();
    
    for (const file of report.files) {
      for (const violation of file.violations) {
        if (!rulesMap.has(violation.ruleId)) {
          rulesMap.set(violation.ruleId, {
            id: violation.ruleId,
            shortDescription: violation.message.split('.')[0] + '.',
          });
        }
      }
    }
    
    return Array.from(rulesMap.values());
  }

  private extractSarifResults(report: AnalysisReport): unknown[] {
    const results: unknown[] = [];
    
    for (const file of report.files) {
      for (const violation of file.violations) {
        results.push({
          ruleId: violation.ruleId,
          level: this.mapSeverityToSarifLevel(violation.severity),
          message: {
            text: violation.message,
          },
          locations: [{
            physicalLocation: {
              artifactLocation: {
                uri: file.filePath,
              },
              region: {
                startLine: violation.range.start.line,
                startColumn: violation.range.start.column,
              },
            },
          }],
        });
      }
    }
    
    return results;
  }

  private mapSeverityToSarifLevel(severity: string): string {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'note';
      default:
        return 'none';
    }
  }

  private formatJson(report: AnalysisReport): string {
    return JSON.stringify(report, null, 2);
  }

  private formatHtml(report: AnalysisReport): string {
    const lines: string[] = [];
    lines.push('<!DOCTYPE html>');
    lines.push('<html lang="en">');
    lines.push('<head>');
    lines.push('<meta charset="UTF-8">');
    lines.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    lines.push('<title>CodeForge Analysis Report</title>');
    lines.push('<style>');
    lines.push('body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; background: #1a1a2e; color: #e0e0e0; }');
    lines.push('.container { max-width: 1200px; margin: 0 auto; }');
    lines.push('h1 { color: #a78bfa; margin-bottom: 20px; }');
    lines.push('.summary { background: #2d2d3a; padding: 15px; border-radius: 8px; margin-bottom: 20px; }');
    lines.push('.summary span { margin-right: 20px; }');
    lines.push('.error { color: #ff6b6b; }');
    lines.push('.warning { color: #f0c674; }');
    lines.push('.info { color: #4ecdc4; }');
    lines.push('.file { background: #2d2d3a; padding: 15px; border-radius: 8px; margin-bottom: 15px; }');
    lines.push('.file-path { font-weight: bold; color: #a78bfa; margin-bottom: 10px; }');
    lines.push('.violation { padding: 8px 12px; margin: 5px 0; background: #1a1a2e; border-radius: 4px; }');
    lines.push('.violation .location { color: #888; font-size: 0.9em; }');
    lines.push('.violation .rule { color: #666; font-size: 0.8em; }');
    lines.push('</style>');
    lines.push('</head>');
    lines.push('<body>');
    lines.push('<div class="container">');
    lines.push('<h1>CodeForge Analysis Report</h1>');
    lines.push('<div class="summary">');
    lines.push(`<span>Files: ${report.summary.totalFiles}</span>`);
    lines.push(`<span class="error">Errors: ${report.summary.errors}</span>`);
    lines.push(`<span class="warning">Warnings: ${report.summary.warnings}</span>`);
    lines.push(`<span class="info">Info: ${report.summary.info}</span>`);
    lines.push(`<span>Duration: ${report.summary.duration.toFixed(2)}ms</span>`);
    lines.push('</div>');

    for (const file of report.files) {
      if (file.violations.length === 0) continue;
      lines.push('<div class="file">');
      lines.push(`<div class="file-path">${this.escapeHtml(file.filePath)}</div>`);
      for (const violation of file.violations) {
        const severityClass = violation.severity;
        lines.push('<div class="violation">');
        lines.push(`<span class="${severityClass}">[${violation.severity.toUpperCase()}]</span>`);
        lines.push(` ${this.escapeHtml(violation.message)} `);
        lines.push(`<span class="location">at line ${violation.range.start.line}:${violation.range.start.column}</span>`);
        lines.push(`<span class="rule">${this.escapeHtml(violation.ruleId)}</span>`);
        lines.push('</div>');
      }
      lines.push('</div>');
    }

    lines.push('</div>');
    lines.push('</body>');
    lines.push('</html>');
    return lines.join('\n');
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private formatConsole(report: AnalysisReport): string {
    const lines: string[] = [];

    if (!this.options.quiet) {
      lines.push('');
      lines.push(`${COLORS.bold}CodeForge Analysis Report${COLORS.reset}`);
      lines.push('');
    }

    for (const file of report.files) {
      if (file.violations.length === 0) continue;

      lines.push(`${COLORS.bold}${file.filePath}${COLORS.reset}`);

      for (const violation of file.violations) {
        const severityColor = this.getSeverityColor(violation.severity);
        const severityLabel = violation.severity.toUpperCase().padEnd(7);

        lines.push(
          `  ${severityColor}${severityLabel}${COLORS.reset} ` +
            `[${violation.range.start.line}:${violation.range.start.column}] ` +
            `${violation.message} ` +
            `${COLORS.dim}${violation.ruleId}${COLORS.reset}`
        );

        if (this.options.verbose && violation.suggestion) {
          lines.push(`    ${COLORS.dim}Suggestion: ${violation.suggestion}${COLORS.reset}`);
        }
      }

      lines.push('');
    }

    const { summary } = report;
    lines.push(`${COLORS.bold}Summary${COLORS.reset}`);
    lines.push(`  Files analyzed: ${summary.totalFiles}`);
    lines.push(`  Total violations: ${summary.totalViolations}`);
    lines.push(`    ${COLORS.red}Errors: ${summary.errors}${COLORS.reset}`);
    lines.push(`    ${COLORS.yellow}Warnings: ${summary.warnings}${COLORS.reset}`);
    lines.push(`    ${COLORS.blue}Info: ${summary.info}${COLORS.reset}`);
    lines.push(`  Duration: ${summary.duration.toFixed(2)}ms`);
    lines.push('');

    return lines.join('\n');
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'error':
        return COLORS.red;
      case 'warning':
        return COLORS.yellow;
      case 'info':
        return COLORS.blue;
      default:
        return COLORS.reset;
    }
  }

  async writeReport(report: AnalysisReport): Promise<void> {
    const content = this.formatReport(report);

    if (this.options.outputPath) {
      const absolutePath = path.resolve(this.options.outputPath);
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, content, 'utf-8');
    } else {
      console.log(content);
    }
  }

  printProgress(message: string): void {
    if (!this.options.quiet) {
      console.log(message);
    }
  }
}
