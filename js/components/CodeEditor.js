/**
 * WebCraft - Code Editor Component
 * Gère l'éditeur de code avec coloration syntaxique, exécution, etc.
 */

class CodeEditor {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            html: null,
            css: null,
            js: null,
            result: null,
            ...options
        };

        this.code = {
            html: this.options.html ? this.options.html.textContent : '<!DOCTYPE html>\n<html>\n<head>\n    <title>Ma Page</title>\n</head>\n<body>\n    <h1>Bonjour</h1>\n</body>\n</html>',
            css: this.options.css ? this.options.css.textContent : 'body {\n    font-family: Arial, sans-serif;\n}',
            js: this.options.js ? this.options.js.textContent : ''
        };

        this.initialCode = { ...this.code };
        this.timeout = null;

        this.init();
    }

    init() {
        this.setupTabs();
        this.setupEditors();
        this.setupAutoRun();
        this.setupShortcuts();
    }

    setupTabs() {
        const tabBtns = this.container.querySelectorAll('.tab-btn');
        const panels = this.container.querySelectorAll('.panel');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                const panelId = btn.dataset.tab;
                const panel = this.container.querySelector(`.${panelId}-panel`);
                if (panel) {
                    panel.classList.add('active');
                }
            });
        });
    }

    setupEditors() {
        const editors = this.container.querySelectorAll('.code-content');

        editors.forEach(editor => {
            const panel = editor.closest('.panel');
            const panelType = panel ? panel.dataset.panel : null;

            if (panelType && this.options[panelType]) {
                this.code[panelType] = this.options[panelType].textContent;
                this.initialCode[panelType] = this.code[panelType];
                editor.textContent = this.code[panelType];
                this.updateLineNumbers(editor);

                editor.addEventListener('input', (e) => {
                    this.code[panelType] = editor.textContent;
                    this.debouncedRun();
                    this.updateLineNumbers(editor);
                });

                editor.addEventListener('focus', () => {
                    this.updateLineNumbers(editor);
                });

                this.updateLineNumbers(editor);
            }
        });
    }

    updateLineNumbers(editor) {
        const lines = editor.textContent.split('\n').length;
        const lineNumbers = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
        editor.setAttribute('data-line-numbers', lineNumbers);
    }

    setupAutoRun() {
        this.debouncedRun = this.debounce(() => this.run(), 500);
    }

    setupShortcuts() {
        this.container.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.save();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.run();
            }
        });
    }

    run() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.updateStatus('running');

        try {
            const fullHTML = this.combineCode();
            const resultIframe = this.options.result;
            if (resultIframe) {
                const iframeDoc = resultIframe.contentDocument || resultIframe.contentWindow.document;
                iframeDoc.open();
                iframeDoc.write(fullHTML);
                iframeDoc.close();
            }
            this.updateStatus('ready');
        } catch (error) {
            console.error('Erreur lors de l\'exécution du code :', error);
            this.updateStatus('error', error.message);
        }
    }

    combineCode() {
        const cleanHTML = this.sanitizeHTML(this.code.html);
        const cleanCSS = this.sanitizeCSS(this.code.css);
        const cleanJS = this.sanitizeJS(this.code.js);

        const styleTag = `<style>${cleanCSS}</style>`;
        const scriptTag = cleanJS ? `<script>${cleanJS}</script>` : '';

        let finalHTML = cleanHTML;

        const headCloseIndex = finalHTML.toLowerCase().indexOf('</head>');
        if (headCloseIndex !== -1) {
            finalHTML = finalHTML.substring(0, headCloseIndex) + styleTag + finalHTML.substring(headCloseIndex);
        } else {
            const bodyCloseIndex = finalHTML.toLowerCase().indexOf('</body>');
            if (bodyCloseIndex !== -1) {
                finalHTML = finalHTML.substring(0, bodyCloseIndex) + styleTag + finalHTML.substring(bodyCloseIndex);
            } else {
                finalHTML += styleTag;
            }
        }

        if (scriptTag) {
            const bodyCloseIndex = finalHTML.toLowerCase().indexOf('</body>');
            if (bodyCloseIndex !== -1) {
                finalHTML = finalHTML.substring(0, bodyCloseIndex) + scriptTag + finalHTML.substring(bodyCloseIndex);
            } else {
                finalHTML += scriptTag;
            }
        }

        return finalHTML;
    }

    sanitizeHTML(html) {
        return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    sanitizeCSS(css) {
        return css.replace(/expression\([^)]*\)/gi, '');
    }

    sanitizeJS(js) {
        return js;
    }

    updateStatus(status, message = '') {
        const statusEl = this.container.querySelector('.status');
        if (statusEl) {
            statusEl.textContent = message || status;
            statusEl.className = `status ${status}`;
        }
    }

    save() {
        console.log('Code sauvegardé :', this.code);
        this.updateStatus('saved', 'Code sauvegardé');
        setTimeout(() => {
            this.updateStatus('ready');
        }, 2000);
    }

    reset(panelType = null) {
        if (panelType) {
            this.code[panelType] = this.initialCode[panelType];
            const editor = this.container.querySelector(`.${panelType}-panel .code-content`);
            if (editor) {
                editor.textContent = this.code[panelType];
                this.updateLineNumbers(editor);
            }
        } else {
            this.code = { ...this.initialCode };
            const editors = this.container.querySelectorAll('.code-content');
            editors.forEach(editor => {
                const panel = editor.closest('.panel');
                const panelType = panel ? panel.dataset.panel : null;
                if (panelType && this.code[panelType] !== undefined) {
                    editor.textContent = this.code[panelType];
                    this.updateLineNumbers(editor);
                }
            });
        }
        this.run();
        this.updateStatus('ready', 'Code réinitialisé');
    }

    setCode(panelType, code) {
        this.code[panelType] = code;
        this.initialCode[panelType] = code;
        const editor = this.container.querySelector(`.${panelType}-panel .code-content`);
        if (editor) {
            editor.textContent = code;
            this.updateLineNumbers(editor);
        }
    }

    getCode(panelType) {
        return this.code[panelType];
    }

    getAllCode() {
        return { ...this.code };
    }

    format(editor) {
        if (!editor) return;
        const panel = editor.closest('.panel');
        const panelType = panel ? panel.dataset.panel : null;

        if (panelType && this.code[panelType] !== undefined) {
            try {
                let formatted = this.code[panelType].trim();
                formatted = formatted.replace(/^\n+/g, '');
                formatted = formatted.replace(/\n{3,}/g, '\n\n');
                formatted = this.indentCode(formatted, panelType);
                this.code[panelType] = formatted;
                editor.textContent = formatted;
                this.updateLineNumbers(editor);
                this.updateStatus('ready', 'Code formaté');
            } catch (error) {
                console.error('Erreur lors du formatage :', error);
                this.updateStatus('error', 'Erreur de formatage');
            }
        }
    }

    indentCode(code, type) {
        const lines = code.split('\n');
        let indentLevel = 0;
        const indentSize = 2;

        return lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return line;

            if (trimmed.startsWith('</') && !trimmed.startsWith('</')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }

            const indent = ' '.repeat(indentLevel * indentSize);

            if (trimmed.endsWith('>') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
                if (!trimmed.match(/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/i)) {
                    indentLevel += 1;
                }
            }

            return indent + trimmed;
        }).join('\n');
    }

    toggleFullscreen() {
        const isFullscreen = this.container.classList.toggle('fullscreen');
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeEditor;
} else {
    window.WebCraft = window.WebCraft || {};
    window.WebCraft.CodeEditor = CodeEditor;
}