import type { Severity } from './types.js'

export const SEVERITY_COLORS: Record<Severity, string> = {
  error: '#ff6b6b',
  info: '#6bcfff',
  warning: '#ffd93d',
}

export function getHTMLReporterStyles(): string {
  return `
    :root {
      --bg-primary: #1a1a2e;
      --bg-secondary: #16213e;
      --bg-card: #0f3460;
      --text-primary: #eaeaea;
      --text-secondary: #a0a0a0;
      --error-color: ${SEVERITY_COLORS.error};
      --warning-color: ${SEVERITY_COLORS.warning};
      --info-color: ${SEVERITY_COLORS.info};
      --success-color: #6bcb77;
      --border-color: #2d4059;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      padding: 20px;
    }

    .container { max-width: 1200px; margin: 0 auto; }

    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .header h1 { font-size: 2rem; margin-bottom: 10px; }

    .meta { color: var(--text-secondary); font-size: 0.9rem; display: flex; gap: 20px; justify-content: center; }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .summary-card {
      background: var(--bg-secondary);
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: transform 0.2s, border-color 0.2s;
    }

    .summary-card:hover { transform: translateY(-2px); }
    .summary-card.has-errors { border-color: var(--error-color); }
    .summary-card.has-warnings { border-color: var(--warning-color); }

    .summary-icon { font-size: 1.5rem; display: block; margin-bottom: 5px; }
    .summary-icon.error { color: var(--error-color); }
    .summary-icon.warning { color: var(--warning-color); }
    .summary-icon.info { color: var(--info-color); }
    .summary-icon.files { color: var(--text-secondary); }

    .summary-count { font-size: 2rem; font-weight: bold; display: block; }
    .summary-label { color: var(--text-secondary); font-size: 0.9rem; }

    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .filters { display: flex; gap: 10px; flex-wrap: wrap; }

    .filter-btn {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn:hover { background: var(--bg-card); }
    .filter-btn.active { background: var(--bg-card); border-color: var(--info-color); }

    .sort { display: flex; align-items: center; gap: 10px; }
    .sort label { color: var(--text-secondary); }
    .sort select {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 8px;
      border-radius: 4px;
    }

    .actions { display: flex; gap: 10px; }
    .actions button {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .actions button:hover { background: var(--bg-card); }

    .results { margin-bottom: 30px; }

    .no-results {
      text-align: center;
      padding: 60px 20px;
      background: var(--bg-secondary);
      border-radius: 8px;
      font-size: 1.2rem;
      color: var(--success-color);
    }

    .success-icon { font-size: 3rem; display: block; margin-bottom: 10px; }
    .no-results h2 { margin-bottom: 10px; }
    .no-results p { color: var(--text-secondary); }

    .file-section {
      background: var(--bg-secondary);
      border-radius: 8px;
      margin-bottom: 15px;
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    .file-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px 20px;
      cursor: pointer;
      background: var(--bg-card);
      list-style: none;
    }

    .file-header::-webkit-details-marker { display: none; }

    .toggle-icon {
      transition: transform 0.2s;
      font-size: 0.8rem;
    }

    .file-section[open] .toggle-icon { transform: rotate(0deg); }
    .file-section:not([open]) .toggle-icon { transform: rotate(-90deg); }

    .file-path {
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      font-weight: 500;
      flex: 1;
    }

    .file-badges { display: flex; gap: 8px; }

    .badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .badge.error { background: rgba(255, 107, 107, 0.2); color: var(--error-color); }
    .badge.warning { background: rgba(255, 217, 61, 0.2); color: var(--warning-color); }
    .badge.info { background: rgba(107, 207, 255, 0.2); color: var(--info-color); }

    .violations { padding: 10px 0; }

    .violation {
      padding: 15px 20px;
      border-bottom: 1px solid var(--border-color);
      transition: background 0.2s;
    }

    .violation:last-child { border-bottom: none; }
    .violation:hover { background: rgba(255, 255, 255, 0.02); }

    .violation-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .severity-icon {
      font-size: 1rem;
      width: 20px;
      text-align: center;
    }

    .severity-icon.error { color: var(--error-color); }
    .severity-icon.warning { color: var(--warning-color); }
    .severity-icon.info { color: var(--info-color); }

    .location {
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .rule-id {
      margin-left: auto;
      background: var(--bg-primary);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-family: monospace;
    }

    .violation-message { padding-left: 30px; }

    .source-code {
      margin: 10px 0 10px 30px;
      padding: 10px;
      background: var(--bg-primary);
      border-radius: 4px;
      overflow-x: auto;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      font-size: 0.85rem;
    }

    .suggestion {
      margin: 10px 0 0 30px;
      padding: 10px;
      background: rgba(107, 203, 119, 0.1);
      border-left: 3px solid var(--success-color);
      border-radius: 0 4px 4px 0;
      font-size: 0.9rem;
    }

    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
      color: var(--text-secondary);
      font-size: 0.9rem;
      display: flex;
      justify-content: space-between;
    }

    .hidden { display: none !important; }
  `
}
