/**
 * QuizView - Handles quiz rendering and validation
 */

class QuizView {
  constructor(quizData, userProgress, lessonId) {
    this.quizData = quizData;
    this.userProgress = userProgress;
    this.lessonId = lessonId;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.answers = [];
    this.init();
  }

  init() {
    this.renderQuiz();
    this.setupEventListeners();
  }

  renderQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    if (!quizContainer) return;

    quizContainer.innerHTML = '';

    this.renderQuizHeader(quizContainer);
    this.renderQuestion(quizContainer);
    this.renderNavigation(quizContainer);
  }

  renderQuizHeader(container) {
    const header = document.createElement('header');
    header.className = 'quiz-header';

    const title = document.createElement('h1');
    title.className = 'quiz-title';
    title.textContent = this.quizData.title || 'Quiz';

    const description = document.createElement('p');
    description.className = 'quiz-description';
    description.textContent = this.quizData.description || '';

    const progress = document.createElement('div');
    progress.className = 'quiz-progress';
    progress.id = 'quiz-progress';

    header.append(title, description, progress);
    container.appendChild(header);
  }

  renderQuestion(container) {
    const questionContainer = document.createElement('div');
    questionContainer.className = 'quiz-question-container';
    questionContainer.id = 'quiz-question-container';

    const currentQuestion = this.quizData.questions[this.currentQuestionIndex];

    const question = document.createElement('div');
    question.className = 'quiz-question';

    const questionNumber = document.createElement('span');
    questionNumber.className = 'question-number';
    questionNumber.textContent = `Question ${this.currentQuestionIndex + 1}/${this.quizData.questions.length}`;

    const questionText = document.createElement('h2');
    questionText.className = 'question-text';
    questionText.textContent = currentQuestion.question;

    question.append(questionNumber, questionText);

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'quiz-options';
    optionsContainer.id = 'quiz-options';

    currentQuestion.options.forEach((option, index) => {
      const optionEl = this.createOptionElement(option, index, currentQuestion);
      optionsContainer.appendChild(optionEl);
    });

    const explanation = document.createElement('div');
    explanation.className = 'quiz-explanation';
    explanation.id = 'quiz-explanation';
    explanation.style.display = 'none';

    questionContainer.append(question, optionsContainer, explanation);
    container.appendChild(questionContainer);

    this.updateProgress();
  }

  createOptionElement(option, index, question) {
    const optionEl = document.createElement('label');
    optionEl.className = 'quiz-option';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'quiz-option';
    radio.value = index;
    radio.dataset.index = index;

    const optionText = document.createElement('span');
    optionText.className = 'option-text';
    optionText.textContent = option;

    optionEl.append(radio, optionText);

    if (this.answers[this.currentQuestionIndex] === index) {
      radio.checked = true;
    }

    return optionEl;
  }

  renderNavigation(container) {
    const nav = document.createElement('nav');
    nav.className = 'quiz-nav';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-secondary';
    prevBtn.id = 'quiz-prev';
    prevBtn.textContent = 'Précédent';
    prevBtn.disabled = this.currentQuestionIndex === 0;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary';
    nextBtn.id = 'quiz-next';
    nextBtn.textContent = this.currentQuestionIndex < this.quizData.questions.length - 1 ? 'Suivant' : 'Terminer';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-success';
    submitBtn.id = 'quiz-submit';
    submitBtn.textContent = 'Valider';
    submitBtn.style.display = this.currentQuestionIndex < this.quizData.questions.length - 1 ? 'none' : 'inline-block';

    nav.append(prevBtn, nextBtn, submitBtn);
    container.appendChild(nav);
  }

  setupEventListeners() {
    const prevBtn = document.getElementById('quiz-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentQuestionIndex > 0) {
          this.currentQuestionIndex--;
          this.renderQuestion(document.getElementById('quiz-container'));
        }
      });
    }

    const nextBtn = document.getElementById('quiz-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.saveCurrentAnswer();
        if (this.currentQuestionIndex < this.quizData.questions.length - 1) {
          this.currentQuestionIndex++;
          this.renderQuestion(document.getElementById('quiz-container'));
        } else {
          nextBtn.style.display = 'none';
          document.getElementById('quiz-submit').style.display = 'inline-block';
        }
      });
    }

    const submitBtn = document.getElementById('quiz-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        this.saveCurrentAnswer();
        this.submitQuiz();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        if (this.currentQuestionIndex > 0) {
          this.currentQuestionIndex--;
          this.renderQuestion(document.getElementById('quiz-container'));
        }
      } else if (e.key === 'ArrowRight') {
        this.saveCurrentAnswer();
        if (this.currentQuestionIndex < this.quizData.questions.length - 1) {
          this.currentQuestionIndex++;
          this.renderQuestion(document.getElementById('quiz-container'));
        }
      }
    });
  }

  saveCurrentAnswer() {
    const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
    if (selectedOption) {
      const answerIndex = parseInt(selectedOption.dataset.index);
      this.answers[this.currentQuestionIndex] = answerIndex;
    }
  }

  updateProgress() {
    const progressBar = document.getElementById('quiz-progress');
    if (!progressBar) return;

    const percentage = ((this.currentQuestionIndex + 1) / this.quizData.questions.length) * 100;
    progressBar.textContent = `Progression : ${Math.round(percentage)}% (${this.currentQuestionIndex + 1}/${this.quizData.questions.length})`;
  }

  submitQuiz() {
    this.score = 0;
    this.quizData.questions.forEach((question, index) => {
      const userAnswer = this.answers[index];
      if (userAnswer === question.correctAnswer) {
        this.score++;
      }
    });

    this.userProgress.completeQuiz(this.lessonId, this.quizData.id, this.score, this.quizData.questions.length);
    this.showResults();
  }

  showResults() {
    const quizContainer = document.getElementById('quiz-container');
    if (!quizContainer) return;

    quizContainer.innerHTML = '';

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'quiz-results';

    const title = document.createElement('h1');
    title.textContent = 'Résultats du quiz';

    const scoreText = document.createElement('p');
    scoreText.className = 'quiz-score';
    const percentage = (this.score / this.quizData.questions.length) * 100;
    scoreText.textContent = `Score : ${this.score}/${this.quizData.questions.length} (${Math.round(percentage)}%)`;

    const grade = this.getGrade(percentage);
    const gradeElement = document.createElement('div');
    gradeElement.className = `quiz-grade ${grade.toLowerCase()}`;
    gradeElement.textContent = grade;

    const feedback = document.createElement('p');
    feedback.className = 'quiz-feedback';
    feedback.textContent = this.getFeedback(percentage);

    const xpText = document.createElement('p');
    xpText.className = 'quiz-xp';
    xpText.textContent = `+${this.calculateXP(this.score, this.quizData.questions.length)} XP`;

    const reviewTitle = document.createElement('h2');
    reviewTitle.textContent = 'Révision des questions';

    const reviewList = document.createElement('div');
    reviewList.className = 'quiz-review';

    this.quizData.questions.forEach((question, index) => {
      const reviewItem = this.createReviewItem(question, index);
      reviewList.appendChild(reviewItem);
    });

    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-secondary';
    backBtn.textContent = 'Retour à la leçon';
    backBtn.addEventListener('click', () => {
      window.location.href = `lesson.html?lesson=${this.lessonId}`;
    });

    const dashboardBtn = document.createElement('button');
    dashboardBtn.className = 'btn btn-primary';
    dashboardBtn.textContent = 'Retour au tableau de bord';
    dashboardBtn.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });

    resultsContainer.append(
      title, scoreText, gradeElement, feedback, xpText,
      reviewTitle, reviewList, backBtn, dashboardBtn
    );

    quizContainer.appendChild(resultsContainer);
  }

  createReviewItem(question, index) {
    const item = document.createElement('div');
    item.className = 'review-item';

    const questionText = document.createElement('h3');
    questionText.textContent = `Question ${index + 1}: ${question.question}`;

    const userAnswer = this.answers[index];
    const isCorrect = userAnswer === question.correctAnswer;

    const answerText = document.createElement('p');
    answerText.className = `review-answer ${isCorrect ? 'correct' : 'incorrect'}`;

    if (userAnswer !== undefined) {
      answerText.textContent = `Ta réponse : ${question.options[userAnswer]}`;
    } else {
      answerText.textContent = 'Tu n\'as pas répondu à cette question.';
    }

    const correctAnswer = document.createElement('p');
    correctAnswer.className = 'review-correct';
    correctAnswer.textContent = `Réponse correcte : ${question.options[question.correctAnswer]}`;

    const explanation = document.createElement('p');
    explanation.className = 'review-explanation';
    explanation.textContent = question.explanation || '';

    item.append(questionText, answerText, correctAnswer, explanation);
    return item;
  }

  getGrade(percentage) {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Très bien';
    if (percentage >= 70) return 'Bien';
    if (percentage >= 60) return 'Passable';
    if (percentage >= 50) return 'Moyen';
    return 'À améliorer';
  }

  getFeedback(percentage) {
    if (percentage >= 90) return 'Félicitations ! Tu as une excellente compréhension de ce sujet.';
    if (percentage >= 80) return 'Très bon travail ! Continue comme ça.';
    if (percentage >= 70) return 'Bien joué ! Tu as une bonne compréhension.';
    if (percentage >= 60) return 'Pas mal ! Revise certains points pour améliorer.';
    if (percentage >= 50) return 'Tu es sur la bonne voie. Prends le temps de bien comprendre.';
    return 'Ne te décourage pas. Revise la leçon et réessaye.';
  }

  calculateXP(score, total) {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 100;
    if (percentage >= 80) return 80;
    if (percentage >= 70) return 60;
    if (percentage >= 60) return 40;
    if (percentage >= 50) return 20;
    return 10;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuizView;
}