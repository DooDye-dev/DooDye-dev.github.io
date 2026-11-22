/**
 * EditorView - Handles the standalone code editor page
 */

class EditorView {
  constructor(userProgress, coursesData) {
    this.userProgress = userProgress;
    this.coursesData = coursesData;
    this.currentChallenge = null;
    this.init();
  }

  init() {
    const params = new URLSearchParams(window.location.search);
    const challengeId = params.get('challenge');
    const lessonId = params.get('lesson');
    if (challengeId) this.loadChallenge(challengeId, lessonId);
    else if (lessonId) this.loadLessonExercise(lessonId);
    else this.loadDefaultEditor();
    this.setupEventListeners();
  }

  loadChallenge(challengeId, lessonId) {
    let challenge = null;
    if (lessonId) {
      const lesson = this.findLessonById(lessonId);
      if (lesson) {
        const challengeSection = lesson.sections.find(s => s.type === 'challenge' && s.id === challengeId);
        if (challengeSection) challenge = { ...challengeSection, lessonId: lessonId, lessonTitle: lesson.title };
      }
    }
    if (!challenge) challenge = this.createDefaultChallenge(challengeId);
    this.currentChallenge = challenge;
    this.renderChallengeEditor(challenge);
  }

  findLessonById(lessonId) {
    for (const course of this.coursesData.courses) {
      for (const module of course.modules) {
        for (const lesson of module.lessons) if (lesson.id === lessonId) return lesson;
      }
    }
    return null;
  }

  createDefaultChallenge(challengeId) {
    return {
      id: challengeId, title: 'Défi personnalisé', description: 'Crée ta propre page web.',
      requirements: ['Utilise les balises HTML', 'Ajoute du style CSS', 'Rends la page responsive'],
      initialCode: { html: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Mon défi</title>\n</head>\n<body>\n  <h1>Bonjour !</h1>\n</body>\n</html>', css: 'body { font-family: Arial; }', js: '' },
      expectedResult: null, xp: 200
    };
  }

  loadLessonExercise(lessonId) {
    const lesson = this.findLessonById(lessonId);
    if (!lesson) { this.loadDefaultEditor(); return; }
    const exerciseSection = lesson.sections.find(s => s.type === 'interactive_exercise');
    if (exerciseSection) { this.currentChallenge = { ...exerciseSection, lessonId: lessonId, lessonTitle: lesson.title }; this.renderExerciseEditor(exerciseSection, lesson); }
    else this.loadDefaultEditor();
  }

  loadDefaultEditor() {
    this.currentChallenge = {
      id: 'default', title: 'Éditeur de code', description: 'Utilise cet éditeur pour pratiquer HTML, CSS et JavaScript.',
      initialCode: { html: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Ma page</title>\n</head>\n<body>\n  <h1>Bonjour !</h1>\n</body>\n</html>', css: 'body { font-family: Arial; }', js: '' }
    };
    this.renderDefaultEditor();
  }

  renderChallengeEditor(challenge) {
    const editorContainer = document.getElementById('editor-container');
    if (!editorContainer) return;
    editorContainer.innerHTML = '';

    const header = document.createElement('header'); header.className = 'editor-header';
    const title = document.createElement('h1'); title.className = 'editor-title'; title.textContent = challenge.title;
    const backBtn = document.createElement('button'); backBtn.className = 'btn btn-secondary'; backBtn.innerHTML = '<i class="icon arrow-left"></i> Retour';
    backBtn.addEventListener('click', () => { if (challenge.lessonId) window.location.href = `lesson.html?lesson=${challenge.lessonId}`; else window.location.href = 'lessons.html'; });
    header.append(backBtn, title);

    const description = document.createElement('div'); description.className = 'editor-description';
    description.innerHTML = `<p>${challenge.description}</p>`;
    if (challenge.requirements && challenge.requirements.length > 0) {
      const requirementsTitle = document.createElement('h3'); requirementsTitle.textContent = 'Consignes :';
      const requirementsList = document.createElement('ul');
      challenge.requirements.forEach(req => { const item = document.createElement('li'); item.textContent = req; requirementsList.appendChild(item); });
      description.append(requirementsTitle, requirementsList);
    }

    const codeEditor = this.createCodeEditor(challenge.initialCode);
    const previewContainer = this.createPreviewContainer();
    const actionsContainer = this.createActionsContainer(challenge);
    editorContainer.append(header, description, codeEditor, previewContainer, actionsContainer);
    this.initializeCodeEditor(codeEditor, previewContainer, challenge);
  }

  createCodeEditor(initialCode) {
    const container = document.createElement('div'); container.className = 'code-editor-container';
    const tabsContainer = document.createElement('div'); tabsContainer.className = 'editor-tabs';
    const htmlTab = document.createElement('button'); htmlTab.className = 'editor-tab active'; htmlTab.textContent = 'HTML'; htmlTab.dataset.tab = 'html';
    const cssTab = document.createElement('button'); cssTab.className = 'editor-tab'; cssTab.textContent = 'CSS'; cssTab.dataset.tab = 'css';
    const jsTab = document.createElement('button'); jsTab.className = 'editor-tab'; jsTab.textContent = 'JS'; jsTab.dataset.tab = 'js';
    tabsContainer.append(htmlTab, cssTab, jsTab);
    const htmlArea = this.createCodeArea('html', initialCode.html || '');
    const cssArea = this.createCodeArea('css', initialCode.css || '', true);
    const jsArea = this.createCodeArea('js', initialCode.js || '', true);
    container.append(tabsContainer, htmlArea, cssArea, jsArea);
    return container;
  }

  createCodeArea(language, value, hidden = false) {
    const container = document.createElement('div'); container.className = `code-area ${language}-area`; container.dataset.tab = language;
    if (hidden) container.style.display = 'none';
    const label = document.createElement('label'); label.className = 'code-area-label'; label.textContent = language.toUpperCase();
    const textarea = document.createElement('textarea'); textarea.className = `code-input ${language}-input`; textarea.value = value; textarea.spellcheck = false; textarea.dataset.tab = language;
    container.append(label, textarea); return container;
  }

  createPreviewContainer() {
    const container = document.createElement('div'); container.className = 'preview-container';
    const title = document.createElement('h3'); title.textContent = 'Prévisualisation';
    const previewFrame = document.createElement('iframe'); previewFrame.className = 'preview-frame'; previewFrame.sandbox = 'allow-same-origin allow-scripts'; previewFrame.id = 'preview-frame';
    container.append(title, previewFrame); return container;
  }

  createActionsContainer(challenge) {
    const container = document.createElement('div'); container.className = 'editor-actions';
    const runBtn = document.createElement('button'); runBtn.className = 'btn btn-primary'; runBtn.innerHTML = '<i class="icon play"></i> Exécuter'; runBtn.id = 'run-code';
    if (challenge.expectedResult) {
      const validateBtn = document.createElement('button'); validateBtn.className = 'btn btn-success'; validateBtn.innerHTML = '<i class="icon check"></i> Valider'; validateBtn.id = 'validate-code';
      container.append(runBtn, validateBtn);
    } else { container.appendChild(runBtn); }
    const resultContainer = document.createElement('div'); resultContainer.className = 'editor-result'; resultContainer.id = 'editor-result';
    container.appendChild(resultContainer); return container;
  }

  initializeCodeEditor(codeEditor, previewContainer, challenge) {
    const previewFrame = previewContainer.querySelector('.preview-frame');
    const tabs = codeEditor.querySelectorAll('.editor-tab');
    const codeAreas = codeEditor.querySelectorAll('.code-area');
    tabs.forEach(tab => { tab.addEventListener('click', () => { tabs.forEach(t => t.classList.remove('active')); tab.classList.add('active'); const tabType = tab.dataset.tab; codeAreas.forEach(area => { area.style.display = area.dataset.tab === tabType ? 'block' : 'none'; }); }); });
    const htmlArea = codeEditor.querySelector('.html-input'); const cssArea = codeEditor.querySelector('.css-input'); const jsArea = codeEditor.querySelector('.js-input');
    const runBtn = document.getElementById('run-code');
    if (runBtn) runBtn.addEventListener('click', () => { this.runCode(htmlArea, cssArea, jsArea, previewFrame); });
    const validateBtn = document.getElementById('validate-code');
    if (validateBtn && challenge.expectedResult) {
      validateBtn.addEventListener('click', () => {
        const isValid = this.validateCode(htmlArea, cssArea, jsArea, challenge);
        const resultContainer = document.getElementById('editor-result');
        if (isValid) { resultContainer.innerHTML = '✓ Exercice réussi !'; resultContainer.className = 'editor-result success'; validateBtn.disabled = true; validateBtn.textContent = 'Validé ✓'; }
        else { resultContainer.innerHTML = '✗ Essaye encore.'; resultContainer.className = 'editor-result error'; }
      });
    }
    let timeout;
    [htmlArea, cssArea, jsArea].forEach(area => { if (area) area.addEventListener('input', () => { clearTimeout(timeout); timeout = setTimeout(() => { this.runCode(htmlArea, cssArea, jsArea, previewFrame); }, 500); }); });
    this.runCode(htmlArea, cssArea, jsArea, previewFrame);
  }

  runCode(htmlArea, cssArea, jsArea) {
    const previewFrame = document.getElementById('preview-frame');
    if (!previewFrame) return;
    try {
      const html = htmlArea ? htmlArea.value : ''; const css = cssArea ? cssArea.value : ''; const js = jsArea ? jsArea.value : '';
      const previewHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head><body>${html}<script>${js}</script></body></html>`;
      previewFrame.srcdoc = previewHtml;
    } catch (error) { console.error('Error:', error); }
  }

  validateCode(htmlArea, cssArea, jsArea, challenge) {
    if (challenge.expectedResult) {
      const html = htmlArea ? htmlArea.value : ''; const css = cssArea ? cssArea.value : ''; const js = jsArea ? jsArea.value : '';
      if (typeof challenge.expectedResult === 'string') return html.includes(challenge.expectedResult) || css.includes(challenge.expectedResult) || js.includes(challenge.expectedResult);
      if (Array.isArray(challenge.expectedResult)) return challenge.expectedResult.every(text => html.includes(text) || css.includes(text) || js.includes(text));
    }
    return htmlArea.value.trim() !== '';
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); this.saveCode(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); const runBtn = document.getElementById('run-code'); if (runBtn) runBtn.click(); }
    });
  }

  saveCode() { const htmlArea = document.querySelector('.html-input'); const cssArea = document.querySelector('.css-input'); const jsArea = document.querySelector('.js-input'); if (htmlArea || cssArea || jsArea) { const savedCode = { html: htmlArea ? htmlArea.value : '', css: cssArea ? cssArea.value : '', js: jsArea ? jsArea.value : '', timestamp: new Date().toISOString() }; localStorage.setItem('savedCode', JSON.stringify(savedCode)); } }
}

if (typeof module !== 'undefined' && module.exports) { module.exports = EditorView; }