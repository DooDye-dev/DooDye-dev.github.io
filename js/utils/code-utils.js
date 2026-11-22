/**
 * Code utilities for handling HTML, CSS, and JavaScript code
 */

const CodeUtils = {
  formatHtml: (html) => {
    if (!html) return '';

    let formatted = html.trim();

    formatted = formatted.replace(/(<[^>]+>)([^<])/g, '$1\n$2');
    formatted = formatted.replace(/([^>])(<\/[^>]+>)/g, '$1\n$2');

    let indent = 0;
    const lines = formatted.split('\n');
    const indentedLines = [];

    lines.forEach(line => {
      const trimmed = line.trim();

      if (!trimmed) {
        indentedLines.push('');
        return;
      }

      if (trimmed.startsWith('</')) {
        indent--;
        indentedLines.push('  '.repeat(indent) + trimmed);
        return;
      }

      if (trimmed.endsWith('/>') || /^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/i.test(trimmed)) {
        indentedLines.push('  '.repeat(indent) + trimmed);
        return;
      }

      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
        indentedLines.push('  '.repeat(indent) + trimmed);
        indent++;
        return;
      }

      indentedLines.push('  '.repeat(indent) + trimmed);
    });

    return indentedLines.join('\n');
  },

  formatCss: (css) => {
    if (!css) return '';

    let formatted = css.trim();
    formatted = formatted.replace(/([^{]){/g, '$1\n{');
    formatted = formatted.replace(/}([^}])/g, '}\n$1');

    let indent = 0;
    const lines = formatted.split('\n');
    const indentedLines = [];

    lines.forEach(line => {
      const trimmed = line.trim();

      if (!trimmed) {
        indentedLines.push('');
        return;
      }

      if (trimmed === '}') {
        indent--;
        indentedLines.push('  '.repeat(indent) + trimmed);
        return;
      }

      if (trimmed.endsWith('{')) {
        indentedLines.push('  '.repeat(indent) + trimmed);
        indent++;
        return;
      }

      if (indent > 0) {
        indentedLines.push('  '.repeat(indent) + trimmed);
      } else {
        indentedLines.push(trimmed);
      }
    });

    return indentedLines.join('\n');
  },

  formatJs: (js) => {
    if (!js) return '';

    let formatted = js.trim();
    formatted = formatted.replace(/([^{]){/g, '$1\n{');
    formatted = formatted.replace(/}([^}])/g, '}\n$1');

    let indent = 0;
    const lines = formatted.split('\n');
    const indentedLines = [];

    lines.forEach(line => {
      const trimmed = line.trim();

      if (!trimmed) {
        indentedLines.push('');
        return;
      }

      if (trimmed === '}' || trimmed === '});') {
        indent--;
        indentedLines.push('  '.repeat(indent) + trimmed);
        return;
      }

      if (trimmed.endsWith('{')) {
        indentedLines.push('  '.repeat(indent) + trimmed);
        indent++;
        return;
      }

      indentedLines.push('  '.repeat(indent) + trimmed);
    });

    return indentedLines.join('\n');
  },

  minifyHtml: (html) => {
    if (!html) return '';
    return html
      .replace(/\s+/g, ' ')
      .replace(/\s*([<>])\s*/g, '$1')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim();
  },

  minifyCss: (css) => {
    if (!css) return '';
    return css
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}:;,>])\s*/g, '$1')
      .replace(/;}/g, '}')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();
  },

  minifyJs: (js) => {
    if (!js) return '';
    return js
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}();,:=\+\-\*/%<>!&|^~\[\]])\s*/g, '$1')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '')
      .trim();
  },

  extractHtmlStructure: (html) => {
    if (!html) return '';
    return html
      .replace(/>([^<]+)</g, '><')
      .replace(/\s+/g, ' ')
      .trim();
  },

  countLines: (code) => {
    if (!code) return 0;
    return code.split('\n').filter(line => line.trim() !== '').length;
  },

  countChars: (code) => {
    if (!code) return 0;
    return code.replace(/\s/g, '').length;
  },

  isValidHtml: (html) => {
    if (!html) return false;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const parserErrors = doc.querySelector('parsererror');
      return !parserErrors;
    } catch (error) {
      return false;
    }
  },

  isValidCss: (css) => {
    if (!css) return true;
    try {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
      document.head.removeChild(style);
      return true;
    } catch (error) {
      return false;
    }
  },

  isValidJs: (js) => {
    if (!js) return true;
    try {
      new Function(js);
      return true;
    } catch (error) {
      return false;
    }
  },

  extractHtmlTags: (html) => {
    if (!html) return [];
    const tags = [];
    const tagRegex = /<([a-z][a-z0-9]*)/gi;
    let match;
    while ((match = tagRegex.exec(html)) !== null) {
      const tag = match[1].toLowerCase();
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
    return tags;
  },

  extractCssSelectors: (css) => {
    if (!css) return [];
    const selectors = [];
    const selectorRegex = /([^{]+)\s*{/g;
    let match;
    while ((match = selectorRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      if (selector && !selectors.includes(selector)) {
        selectors.push(selector);
      }
    }
    return selectors;
  },

  extractCssProperties: (css) => {
    if (!css) return [];
    const properties = [];
    const propertyRegex = /([a-z-]+)\s*:/gi;
    let match;
    while ((match = propertyRegex.exec(css)) !== null) {
      const property = match[1].toLowerCase();
      if (!properties.includes(property)) {
        properties.push(property);
      }
    }
    return properties;
  },

  generatePreview: (html, css, js) => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${css || ''}</style>
</head>
<body>
  ${html || ''}
  <script>${js || ''}</script>
</body>
</html>`;
  },

  createBlobUrl: (html, css, js) => {
    const previewHtml = this.generatePreview(html, css, js);
    const blob = new Blob([previewHtml], { type: 'text/html' });
    return URL.createObjectURL(blob);
  },

  revokeBlobUrl: (url) => {
    URL.revokeObjectURL(url);
  },

  downloadCode: (code, filename, mimeType = 'text/plain') => {
    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  },

  copyToClipboard: (code) => {
    return navigator.clipboard.writeText(code);
  },

  containsTag: (code, tag) => {
    if (!code) return false;
    const tagRegex = new RegExp(`<${tag}[\\s>]`, 'i');
    return tagRegex.test(code);
  },

  containsClass: (code, className) => {
    if (!code) return false;
    const classRegex = new RegExp(`class\\s*=\\s*["'][^"']*\\b${className}\\b[^"']*["']`, 'i');
    return classRegex.test(code);
  },

  containsId: (code, id) => {
    if (!code) return false;
    const idRegex = new RegExp(`id\\s*=\\s*["']${id}["']`, 'i');
    return idRegex.test(code);
  },

  containsCssProperty: (code, property) => {
    if (!code) return false;
    const propertyRegex = new RegExp(`${property}\\s*:`, 'i');
    return propertyRegex.test(code);
  },

  getUniqueWords: (code) => {
    if (!code) return [];
    const words = code
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word && word.length > 2)
      .filter((word, index, self) => self.indexOf(word) === index);
    return words;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CodeUtils;
}