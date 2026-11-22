/**
 * LessonView - Handles rendering and interaction for individual lessons
 * Loads lesson data from JSON and dynamically generates the lesson interface
 */

class LessonView {
  constructor(lessonData, userProgress, coursesData) {
    this.lessonData = lessonData;
    this.userProgress = userProgress;
    this.coursesData = coursesData;
    this.currentSectionIndex = 0;
    this.sections = lessonData.sections || [];
    this.lessonElement = document.getElementById('lesson-container');
    this.init();
  }

  init() {
    this.renderLessonHeader();
    this.renderNavigation();
    this.renderSectionContent(this.sections[this.currentSectionIndex]);
    this.setupEventListeners();
    this.updateProgress();
    this.userProgress.startLesson(this.lessonData.id);
  }

  renderLessonHeader() {
    const header = document.createElement('header');
    header.className = 'lesson-header';

    const title = document.createElement('h1');
    title.className = 'lesson-title';
    title.textContent = this.lessonData.title;

    const metadata = document.createElement('div');
    metadata.className = 'lesson-metadata';

    const levelBadge = document.createElement('span');
    levelBadge.className = `badge level-${this.lessonData.level.toLowerCase()}`;
    levelBadge.textContent = this.lessonData.level;

    const duration = document.createElement('span');
    duration.className = 'lesson-duration';
    duration.textContent = `${this.lessonData.duration} min`;

    const category = document.createElement('span');
    category.className = 'lesson-category';
    category.textContent = this.lessonData.category;

    metadata.append(levelBadge, duration, category);
    header.append(title, metadata);
    this.lessonElement.prepend(header);
  }

  renderNavigation() {
    const nav = document.createElement('nav');
    nav.className = 'lesson-nav';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-secondary';
    prevBtn.id = 'prev-section';
    prevBtn.textContent = 'Précédent';
    prevBtn.disabled = this.currentSectionIndex === 0;

    const progressText = document.createElement('span');
    progressText.className = 'section-progress';
    progressText.textContent = `${this.currentSectionIndex + 1}/${this.sections.length}`;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary';
    nextBtn.id = 'next-section';
    nextBtn.textContent = 'Suivant';

    nav.append(prevBtn, progressText, nextBtn);
    this.lessonElement.appendChild(nav);
  }

  renderSectionContent(section) {
    const contentContainer = this.lessonElement.querySelector('.section-content');
    if (contentContainer) contentContainer.remove();

    const container = document.createElement('div');
    container.className = 'section-content';
    container.dataset.sectionType = section.type;
    container.dataset.sectionId = section.id || `section-${this.currentSectionIndex}`;

    switch (section.type) {
      case 'explanation': this.renderExplanationSection(section, container); break;
      case 'code_example': this.renderCodeExampleSection(section, container); break;
      case 'interactive_exercise': this.renderInteractiveExercise(section, container); break;
      case 'quiz': this.renderQuizSection(section, container); break;
      case 'visual_demo': this.renderVisualDemo(section, container); break;
      case 'summary': this.renderSummarySection(section, container); break;
      case 'challenge': this.renderChallengeSection(section, container); break;
      default: this.renderUnknownSection(section, container);
    }

    const nav = this.lessonElement.querySelector('.lesson-nav');
    if (nav) this.lessonElement.insertBefore(container, nav);
    else this.lessonElement.appendChild(container);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderExplanationSection(section, container) {
    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = section.title;

    const content = document.createElement('div');
    content.className = 'section-text';
    content.innerHTML = section.content;

    if (section.image) {
      const img = document.createElement('img');
      img.className = 'section-image';
      img.src = section.image;
      img.alt = section.imageAlt || '';
      content.appendChild(img);
    }

    container.append(title, content);
  }

  renderCodeExampleSection(section, container) {
    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = section.title;

    const description = document.createElement('p');
    description.className = 'section-description';
    description.textContent = section.explanation || '';

    const codeContainer = document.createElement('div');
    codeContainer.className = 'code-example-container';

    if (section.html) {
      const htmlTab = document.createElement('button');
      htmlTab.className = 'code-tab active'; htmlTab.textContent = 'HTML'; htmlTab.dataset.tab = 'html';
      const htmlCode = document.createElement('pre'); htmlCode.className = 'code-block language-html'; htmlCode.textContent = section.html; htmlCode.dataset.tab = 'html';
      codeContainer.append(htmlTab, htmlCode);
    }
    if (section.css) {
      const cssTab = document.createElement('button'); cssTab.className = 'code-tab'; cssTab.textContent = 'CSS'; cssTab.dataset.tab = 'css';
      const cssCode = document.createElement('pre'); cssCode.className = 'code-block language-css'; cssCode.textContent = section.css; cssCode.dataset.tab = 'css'; cssCode.style.display = 'none';
      codeContainer.append(cssTab, cssCode);
    }
    if (section.js) {
      const jsTab = document.createElement('button'); jsTab.className = 'code-tab'; jsTab.textContent = 'JS'; jsTab.dataset.tab = 'js';
      const jsCode = document.createElement('pre'); jsCode.className = 'code-block language-javascript'; jsCode.textContent = section.js; jsCode.dataset.tab = 'js'; jsCode.style.display = 'none';
      codeContainer.append(jsTab, jsCode);
    }

    const previewContainer = document.createElement('div');
    previewContainer.className = 'code-preview-container';
    const previewTitle = document.createElement('h3'); previewTitle.textContent = 'Résultat :';
    const previewFrame = document.createElement('iframe'); previewFrame.className = 'code-preview'; previewFrame.sandbox = 'allow-same-origin'; previewFrame.srcdoc = this.generatePreviewHtml(section);
    previewContainer.append(previewTitle, previewFrame);

    container.append(title, description, codeContainer, previewContainer);
    this.setupCodeTabs(codeContainer);
  }

  generatePreviewHtml(section) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${section.css || ''}</style></head><body>${section.html || ''}<script>${section.js || ''}</script></body></html>`;
  }

  setupCodeTabs(codeContainer) {
    codeContainer.querySelectorAll('.code-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        codeContainer.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabType = tab.dataset.tab;
        codeContainer.querySelectorAll('.code-block').forEach(block => {
          block.style.display = block.dataset.tab === tabType ? 'block' : 'none';
        });
      });
    });
  }

  renderInteractiveExercise(section, container) {
    const title = document.createElement('h2'); title.className = 'section-title'; title.textContent = section.title;
    const instruction = document.createElement('p'); instruction.className = 'exercise-instruction'; instruction.textContent = section.instruction;

    const exerciseContainer = document.createElement('div'); exerciseContainer.className = 'exercise-container';

    const editorContainer = document.createElement('div'); editorContainer.className = 'exercise-editor';
    const editorTitle = document.createElement('h3'); editorTitle.textContent = 'Ton code :';
    const codeTextarea = document.createElement('textarea'); codeTextarea.className = 'code-input'; codeTextarea.id = `exercise-code-${this.currentSectionIndex}`; codeTextarea.value = section.initialCode || ''; codeTextarea.placeholder = 'Écris ton code ici...'; codeTextarea.spellcheck = false;
    editorContainer.append(editorTitle, codeTextarea);

    const previewContainer = document.createElement('div'); previewContainer.className = 'exercise-preview-container';
    const previewTitle = document.createElement('h3'); previewTitle.textContent = 'Prévisualisation :';
    const previewFrame = document.createElement('iframe'); previewFrame.className = 'exercise-preview'; previewFrame.sandbox = 'allow-same-origin'; previewFrame.id = `exercise-preview-${this.currentSectionIndex}`;
    previewContainer.append(previewTitle, previewFrame);

    const actionsContainer = document.createElement('div'); actionsContainer.className = 'exercise-actions';
    const runBtn = document.createElement('button'); runBtn.className = 'btn btn-primary'; runBtn.textContent = 'Exécuter'; runBtn.dataset.action = 'run';
    const validateBtn = document.createElement('button'); validateBtn.className = 'btn btn-success'; validateBtn.textContent = 'Valider'; validateBtn.dataset.action = 'validate';
    const hintBtn = document.createElement('button'); hintBtn.className = 'btn btn-info'; hintBtn.textContent = 'Indice'; hintBtn.dataset.action = 'hint';
    actionsContainer.append(runBtn, validateBtn, hintBtn);

    const resultContainer = document.createElement('div'); resultContainer.className = 'exercise-result'; resultContainer.id = `exercise-result-${this.currentSectionIndex}`;
    exerciseContainer.append(editorContainer, previewContainer, actionsContainer, resultContainer);
    container.append(title, instruction, exerciseContainer);

    this.setupExerciseFunctionality(codeTextarea, previewFrame, runBtn, validateBtn, hintBtn, resultContainer, section);
  }

  setupExerciseFunctionality(codeTextarea, previewFrame, runBtn, validateBtn, hintBtn, resultContainer, section) {
    let hintIndex = 0;

    runBtn.addEventListener('click', () => { this.executeExerciseCode(codeTextarea.value, previewFrame, section); resultContainer.textContent = ''; resultContainer.className = 'exercise-result'; });

    validateBtn.addEventListener('click', () => {
      const isValid = this.validateExercise(codeTextarea.value, section);
      if (isValid) {
        resultContainer.textContent = '✓ Exercice réussi !'; resultContainer.className = 'exercise-result success';
        this.userProgress.completeExercise(this.lessonData.id, section.id);
        validateBtn.disabled = true; validateBtn.textContent = 'Validé ✓';
        this.userProgress.updateLessonProgress(this.lessonData.id, this.sections.length, this.currentSectionIndex + 1); this.updateProgress();
      } else { resultContainer.textContent = '✗ Essaye encore.'; resultContainer.className = 'exercise-result error'; }
    });

    hintBtn.addEventListener('click', () => {
      if (section.hints && section.hints.length > 0) {
        const hint = section.hints[hintIndex % section.hints.length];
        resultContainer.textContent = `💡 Indice : ${hint}`; resultContainer.className = 'exercise-result hint'; hintIndex++;
      }
    });

    let timeout;
    codeTextarea.addEventListener('input', () => { clearTimeout(timeout); timeout = setTimeout(() => { this.executeExerciseCode(codeTextarea.value, previewFrame, section); }, 500); });
    this.executeExerciseCode(codeTextarea.value, previewFrame, section);
  }

  executeExerciseCode(code, previewFrame, section) {
    try {
      const html = section.exerciseType === 'html' ? code : (section.initialCode || '') + code;
      const css = section.exerciseType === 'css' ? code : (section.css || '');
      const js = section.exerciseType === 'js' ? code : (section.js || '');
      const previewHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head><body>${html}<script>${js}</script></body></html>`;
      previewFrame.srcdoc = previewHtml;
    } catch (error) { console.error('Error:', error); }
  }

  validateExercise(userCode, section) {
    if (section.validator) return this.runCustomValidator(userCode, section.validator);
    if (section.expectedResult) return this.checkExpectedResult(userCode, section.expectedResult, section);
    return userCode && userCode.trim() !== '';
  }

  checkExpectedResult(userCode, expectedResult, section) {
    if (typeof expectedResult === 'string') return userCode.includes(expectedResult);
    if (Array.isArray(expectedResult)) return expectedResult.every(text => userCode.includes(text));
    return false;
  }

  renderQuizSection(section, container) {
    const title = document.createElement('h2'); title.className = 'section-title'; title.textContent = section.question || section.title;
    const form = document.createElement('form'); form.className = 'quiz-form'; form.id = `quiz-form-${this.currentSectionIndex}`;

    const question = document.createElement('p'); question.className = 'quiz-question'; question.textContent = section.question || section.title;

    const optionsContainer = document.createElement('div'); optionsContainer.className = 'quiz-options';
    section.answers.forEach((answer, index) => {
      const option = document.createElement('label'); option.className = 'quiz-option';
      const radio = document.createElement('input'); radio.type = 'radio'; radio.name = `quiz-${this.currentSectionIndex}`; radio.value = index; radio.id = `quiz-option-${this.currentSectionIndex}-${index}`;
      const optionText = document.createElement('span'); optionText.textContent = answer;
      option.append(radio, optionText); optionsContainer.append(option);
    });

    const submitBtn = document.createElement('button'); submitBtn.type = 'button'; submitBtn.className = 'btn btn-primary'; submitBtn.textContent = 'Valider'; submitBtn.id = `quiz-submit-${this.currentSectionIndex}`;
    const resultContainer = document.createElement('div'); resultContainer.className = 'quiz-result'; resultContainer.id = `quiz-result-${this.currentSectionIndex}`;
    form.append(question, optionsContainer, submitBtn, resultContainer); container.append(title, form);

    this.setupQuizFunctionality(form, submitBtn, resultContainer, section);
  }

  setupQuizFunctionality(form, submitBtn, resultContainer, section) {
    submitBtn.addEventListener('click', () => {
      const selectedOption = form.querySelector('input[type="radio"]:checked');
      if (!selectedOption) { resultContainer.textContent = 'Veuillez sélectionner une réponse.'; resultContainer.className = 'quiz-result error'; return; }

      const userAnswer = parseInt(selectedOption.value); const isCorrect = userAnswer === section.correctAnswer;
      if (isCorrect) {
        resultContainer.innerHTML = '✓ Bonne réponse !<br>' + (section.explanation || '');
        resultContainer.className = 'quiz-result success';
        this.userProgress.completeQuiz(this.lessonData.id, section.id, true);
        form.querySelectorAll('input[type="radio"]').forEach(radio => { radio.disabled = true; });
        submitBtn.disabled = true; submitBtn.textContent = 'Validé ✓';
        this.userProgress.updateLessonProgress(this.lessonData.id, this.sections.length, this.currentSectionIndex + 1); this.updateProgress();
      } else { resultContainer.innerHTML = '✗ Réponse incorrecte.<br>' + (section.explanation || ''); resultContainer.className = 'quiz-result error'; this.userProgress.completeQuiz(this.lessonData.id, section.id, false); }
    });
  }

  renderVisualDemo(section, container) {
    const title = document.createElement('h2'); title.className = 'section-title'; title.textContent = section.title;
    const description = document.createElement('p'); description.className = 'section-text'; description.textContent = section.description || '';
    const demoContainer = document.createElement('div'); demoContainer.className = 'visual-demo-container'; demoContainer.id = `demo-${this.currentSectionIndex}`;
    demoContainer.innerHTML = '<p>Animation pédagogique en cours de chargement...</p>';
    container.append(title, description, demoContainer);
    if (section.animation) this.loadAnimation(section.animation, demoContainer);
  }

  loadAnimation(animationName, container) {
    const script = document.createElement('script'); script.src = `js/animations/${animationName}.js`;
    script.onload = () => { if (window[animationName]) window[animationName](container); };
    script.onerror = () => { container.innerHTML = `<p>Animation non disponible.</p>`; };
    document.body.appendChild(script);
  }

  renderSummarySection(section, container) {
    const title = document.createElement('h2'); title.className = 'section-title'; title.textContent = section.title || 'Résumé';
    const content = document.createElement('div'); content.className = 'summary-content'; content.innerHTML = section.content;
    if (section.keyPoints) {
      const pointsTitle = document.createElement('h3'); pointsTitle.textContent = 'Points clés :';
      const pointsList = document.createElement('ul');
      section.keyPoints.forEach(point => { const item = document.createElement('li'); item.textContent = point; pointsList.appendChild(item); });
      content.append(pointsTitle, pointsList);
    }
    container.append(title, content);
  }

  renderChallengeSection(section, container) {
    const title = document.createElement('h2'); title.className = 'section-title'; title.textContent = section.title;
    const description = document.createElement('p'); description.className = 'challenge-description'; description.textContent = section.description;
    const requirementsTitle = document.createElement('h3'); requirementsTitle.textContent = 'Consignes :';
    const requirementsList = document.createElement('ul');
    section.requirements.forEach(req => { const item = document.createElement('li'); item.textContent = req; requirementsList.appendChild(item); });
    const startBtn = document.createElement('button'); startBtn.className = 'btn btn-primary btn-large'; startBtn.textContent = 'Commencer le défi'; startBtn.id = `challenge-start-${this.currentSectionIndex}`;
    container.append(title, description, requirementsTitle, requirementsList, startBtn);
    startBtn.addEventListener('click', () => { window.location.href = `editor.html?challenge=${section.id}&lesson=${this.lessonData.id}`; });
  }

  renderUnknownSection(section, container) {
    const title = document.createElement('h2'); title.textContent = section.title || 'Section inconnue';
    const content = document.createElement('p'); content.textContent = 'Ce type de section n\'est pas encore implémenté.';
    container.append(title, content);
  }

  setupEventListeners() {
    const prevBtn = document.getElementById('prev-section');
    if (prevBtn) prevBtn.addEventListener('click', () => { if (this.currentSectionIndex > 0) { this.currentSectionIndex--; this.updateNavigation(); this.renderSectionContent(this.sections[this.currentSectionIndex]); } });

    const nextBtn = document.getElementById('next-section');
    if (nextBtn) nextBtn.addEventListener('click', () => { if (this.currentSectionIndex < this.sections.length - 1) { this.currentSectionIndex++; this.updateNavigation(); this.renderSectionContent(this.sections[this.currentSectionIndex]); } else { this.completeLesson(); } });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { if (this.currentSectionIndex > 0) { this.currentSectionIndex--; this.updateNavigation(); this.renderSectionContent(this.sections[this.currentSectionIndex]); } }
      else if (e.key === 'ArrowRight') { if (this.currentSectionIndex < this.sections.length - 1) { this.currentSectionIndex++; this.updateNavigation(); this.renderSectionContent(this.sections[this.currentSectionIndex]); } }
    });
  }

  updateNavigation() {
    const prevBtn = document.getElementById('prev-section');
    const nextBtn = document.getElementById('next-section');
    const progressText = document.querySelector('.section-progress');
    if (prevBtn) prevBtn.disabled = this.currentSectionIndex === 0;
    if (nextBtn) nextBtn.textContent = this.currentSectionIndex < this.sections.length - 1 ? 'Suivant' : 'Terminer';
    if (progressText) progressText.textContent = `${this.currentSectionIndex + 1}/${this.sections.length}`;
  }

  updateProgress() { const progress = this.userProgress.getLessonProgress(this.lessonData.id); const progressBar = document.getElementById('lesson-progress-bar'); if (progressBar) { const percentage = (progress.completedSections / this.sections.length) * 100; progressBar.style.width = `${percentage}%`; } }

  completeLesson() { this.userProgress.completeLesson(this.lessonData.id); this.showCompletionModal(); }

  showCompletionModal() {
    const modal = document.createElement('div'); modal.className = 'modal'; modal.id = 'lesson-complete-modal';
    const modalContent = document.createElement('div'); modalContent.className = 'modal-content';
    const title = document.createElement('h2'); title.textContent = 'Félicitations !';
    const message = document.createElement('p'); message.textContent = `Tu as terminé : \"${this.lessonData.title}\"`;
    const xpText = document.createElement('p'); xpText.textContent = `+${this.lessonData.xp || 100} XP`; xpText.className = 'xp-text';
    const nextLessonBtn = document.createElement('button'); nextLessonBtn.className = 'btn btn-primary'; nextLessonBtn.textContent = 'Leçon suivante';
    const dashboardBtn = document.createElement('button'); dashboardBtn.className = 'btn btn-secondary'; dashboardBtn.textContent = 'Tableau de bord';
    modalContent.append(title, message, xpText, nextLessonBtn, dashboardBtn); modal.append(modalContent); document.body.append(modal);
    nextLessonBtn.addEventListener('click', () => { modal.remove(); window.location.href = 'lessons.html'; });
    dashboardBtn.addEventListener('click', () => { modal.remove(); window.location.href = 'dashboard.html'; });
    modal.addEventListener('click', (e) => { if (e.target === modal) { modal.remove(); window.location.href = 'dashboard.html'; } });
  }
}

if (typeof module !== 'undefined' && module.exports) { module.exports = LessonView; }