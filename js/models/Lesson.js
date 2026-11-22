/**
 * Lesson Model - Represents a lesson with its sections and metadata
 */

class Lesson {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.title = data.title || 'Nouvelle leçon';
    this.category = data.category || 'HTML';
    this.level = data.level || 'Débutant';
    this.description = data.description || '';
    this.duration = data.duration || 10;
    this.xp = data.xp || 100;
    this.objectives = data.objectives || [];
    this.prerequisites = data.prerequisites || [];
    this.sections = this.parseSections(data.sections || []);
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();

    this.validate();
  }

  generateId() {
    return 'lesson-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }

  parseSections(sectionsData) {
    return sectionsData.map((sectionData, index) => {
      return new Section({
        ...sectionData,
        id: sectionData.id || `section-${index}`,
        lessonId: this.id
      });
    });
  }

  validate() {
    if (!this.id) {
      throw new Error('Lesson ID is required');
    }
    if (!this.title) {
      throw new Error('Lesson title is required');
    }
    if (!this.category) {
      throw new Error('Lesson category is required');
    }
    if (!['Débutant', 'Intermédiaire', 'Avancé'].includes(this.level)) {
      throw new Error(`Invalid level: ${this.level}. Must be one of: Débutant, Intermédiaire, Avancé`);
    }
    if (!Array.isArray(this.sections) || this.sections.length === 0) {
      throw new Error('Lesson must have at least one section');
    }
    this.sections.forEach(section => {
      section.validate();
    });
  }

  getMetadata() {
    return {
      id: this.id,
      title: this.title,
      category: this.category,
      level: this.level,
      description: this.description,
      duration: this.duration,
      xp: this.xp,
      objectives: this.objectives,
      prerequisites: this.prerequisites,
      tags: this.tags,
      sectionCount: this.sections.length
    };
  }

  getExercises() {
    return this.sections.filter(section => section.type === 'interactive_exercise');
  }

  getQuizzes() {
    return this.sections.filter(section => section.type === 'quiz');
  }

  getCodeExamples() {
    return this.sections.filter(section => section.type === 'code_example');
  }

  getSection(sectionId) {
    return this.sections.find(section => section.id === sectionId) || null;
  }

  getSectionByIndex(index) {
    return this.sections[index] || null;
  }

  hasSectionType(type) {
    return this.sections.some(section => section.type === type);
  }

  getExerciseCount() {
    return this.getExercises().length;
  }

  getQuizCount() {
    return this.getQuizzes().length;
  }

  getEstimatedTime() {
    return this.duration;
  }

  getDifficultyLevel() {
    const levels = {
      'Débutant': 1,
      'Intermédiaire': 2,
      'Avancé': 3
    };
    return levels[this.level] || 1;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      category: this.category,
      level: this.level,
      description: this.description,
      duration: this.duration,
      xp: this.xp,
      objectives: this.objectives,
      prerequisites: this.prerequisites,
      sections: this.sections.map(section => section.toJSON()),
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(json) {
    return new Lesson(json);
  }
}

class Section {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.lessonId = data.lessonId || '';
    this.type = data.type || 'explanation';
    this.title = data.title || 'Nouvelle section';
    this.content = data.content || '';
    this.order = data.order !== undefined ? data.order : 0;

    switch (this.type) {
      case 'code_example':
        this.html = data.html || '';
        this.css = data.css || '';
        this.js = data.js || '';
        this.explanation = data.explanation || '';
        break;
      case 'interactive_exercise':
        this.instruction = data.instruction || '';
        this.initialCode = data.initialCode || '';
        this.expectedResult = data.expectedResult || null;
        this.hints = data.hints || [];
        this.exerciseType = data.exerciseType || 'html';
        this.validator = data.validator || null;
        break;
      case 'quiz':
        this.question = data.question || '';
        this.answers = data.answers || [];
        this.correctAnswer = data.correctAnswer !== undefined ? data.correctAnswer : 0;
        this.explanation = data.explanation || '';
        break;
      case 'visual_demo':
        this.animation = data.animation || '';
        this.description = data.description || '';
        break;
      case 'summary':
        this.keyPoints = data.keyPoints || [];
        break;
      case 'challenge':
        this.description = data.description || '';
        this.requirements = data.requirements || [];
        break;
    }

    this.validate();
  }

  generateId() {
    return 'section-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }

  validate() {
    if (!this.id) {
      throw new Error('Section ID is required');
    }
    if (!this.type) {
      throw new Error('Section type is required');
    }
    const validTypes = [
      'explanation', 'code_example', 'interactive_exercise',
      'quiz', 'visual_demo', 'summary', 'challenge'
    ];
    if (!validTypes.includes(this.type)) {
      throw new Error(`Invalid section type: ${this.type}. Must be one of: ${validTypes.join(', ')}`);
    }
    switch (this.type) {
      case 'code_example':
        if (!this.html && !this.css && !this.js) {
          throw new Error('Code example must have at least one code type (html, css, or js)');
        }
        break;
      case 'interactive_exercise':
        if (!this.instruction) {
          throw new Error('Interactive exercise must have an instruction');
        }
        break;
      case 'quiz':
        if (!this.question) {
          throw new Error('Quiz must have a question');
        }
        if (!this.answers || this.answers.length < 2) {
          throw new Error('Quiz must have at least 2 answers');
        }
        if (this.correctAnswer === undefined || this.correctAnswer >= this.answers.length) {
          throw new Error('Quiz must have a valid correct answer index');
        }
        break;
    }
  }

  getTypeLabel() {
    const labels = {
      explanation: 'Explication',
      code_example: 'Exemple de code',
      interactive_exercise: 'Exercice interactif',
      quiz: 'Quiz',
      visual_demo: 'Démonstration visuelle',
      summary: 'Résumé',
      challenge: 'Défi'
    };
    return labels[this.type] || this.type;
  }

  isExercise() {
    return this.type === 'interactive_exercise';
  }

  isQuiz() {
    return this.type === 'quiz';
  }

  isCodeExample() {
    return this.type === 'code_example';
  }

  toJSON() {
    const data = {
      id: this.id,
      lessonId: this.lessonId,
      type: this.type,
      title: this.title,
      content: this.content,
      order: this.order
    };

    switch (this.type) {
      case 'code_example':
        data.html = this.html;
        data.css = this.css;
        data.js = this.js;
        data.explanation = this.explanation;
        break;
      case 'interactive_exercise':
        data.instruction = this.instruction;
        data.initialCode = this.initialCode;
        data.expectedResult = this.expectedResult;
        data.hints = this.hints;
        data.exerciseType = this.exerciseType;
        data.validator = this.validator;
        break;
      case 'quiz':
        data.question = this.question;
        data.answers = this.answers;
        data.correctAnswer = this.correctAnswer;
        data.explanation = this.explanation;
        break;
      case 'visual_demo':
        data.animation = this.animation;
        data.description = this.description;
        break;
      case 'summary':
        data.keyPoints = this.keyPoints;
        break;
      case 'challenge':
        data.description = this.description;
        data.requirements = this.requirements;
        break;
    }

    return data;
  }

  static fromJSON(json) {
    return new Section(json);
  }
}

class Exercise {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.title = data.title || 'Nouvel exercice';
    this.instruction = data.instruction || '';
    this.initialCode = data.initialCode || '';
    this.expectedResult = data.expectedResult || null;
    this.hints = data.hints || [];
    this.exerciseType = data.exerciseType || 'html';
    this.validator = data.validator || null;
    this.xp = data.xp || 50;
    this.difficulty = data.difficulty || 'Débutant';
    this.validate();
  }

  generateId() {
    return 'exercise-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }

  validate() {
    if (!this.id) {
      throw new Error('Exercise ID is required');
    }
    if (!this.instruction) {
      throw new Error('Exercise instruction is required');
    }
    if (!['html', 'css', 'js', 'mixed'].includes(this.exerciseType)) {
      throw new Error(`Invalid exercise type: ${this.exerciseType}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      instruction: this.instruction,
      initialCode: this.initialCode,
      expectedResult: this.expectedResult,
      hints: this.hints,
      exerciseType: this.exerciseType,
      validator: this.validator,
      xp: this.xp,
      difficulty: this.difficulty
    };
  }

  static fromJSON(json) {
    return new Exercise(json);
  }
}

class Quiz {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.title = data.title || 'Nouveau quiz';
    this.description = data.description || '';
    this.questions = this.parseQuestions(data.questions || []);
    this.xp = data.xp || 100;
    this.timeLimit = data.timeLimit || null;
    this.randomOrder = data.randomOrder || false;
    this.validate();
  }

  generateId() {
    return 'quiz-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }

  parseQuestions(questionsData) {
    return questionsData.map((questionData, index) => {
      return new Question({
        ...questionData,
        id: questionData.id || `question-${index}`,
        quizId: this.id
      });
    });
  }

  validate() {
    if (!this.id) {
      throw new Error('Quiz ID is required');
    }
    if (!this.title) {
      throw new Error('Quiz title is required');
    }
    if (!Array.isArray(this.questions) || this.questions.length === 0) {
      throw new Error('Quiz must have at least one question');
    }
    this.questions.forEach(question => {
      question.validate();
    });
  }

  getQuestionCount() {
    return this.questions.length;
  }

  getQuestion(questionId) {
    return this.questions.find(question => question.id === questionId) || null;
  }

  getQuestionByIndex(index) {
    return this.questions[index] || null;
  }

  getShuffledQuestions() {
    return [...this.questions].sort(() => Math.random() - 0.5);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      questions: this.questions.map(question => question.toJSON()),
      xp: this.xp,
      timeLimit: this.timeLimit,
      randomOrder: this.randomOrder
    };
  }

  static fromJSON(json) {
    return new Quiz(json);
  }
}

class Question {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.quizId = data.quizId || '';
    this.question = data.question || '';
    this.options = data.options || data.answers || [];
    this.correctAnswer = data.correctAnswer !== undefined ? data.correctAnswer : 0;
    this.explanation = data.explanation || '';
    this.type = data.type || 'multiple_choice';
    this.points = data.points || 1;
    this.validate();
  }

  generateId() {
    return 'question-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }

  validate() {
    if (!this.id) {
      throw new Error('Question ID is required');
    }
    if (!this.question) {
      throw new Error('Question text is required');
    }
    if (!Array.isArray(this.options) || this.options.length < 2) {
      throw new Error('Question must have at least 2 options');
    }
    if (this.correctAnswer === undefined || this.correctAnswer >= this.options.length) {
      throw new Error('Question must have a valid correct answer index');
    }
  }

  isCorrect(answerIndex) {
    return answerIndex === this.correctAnswer;
  }

  getCorrectAnswer() {
    return this.options[this.correctAnswer];
  }

  toJSON() {
    return {
      id: this.id,
      quizId: this.quizId,
      question: this.question,
      options: this.options,
      correctAnswer: this.correctAnswer,
      explanation: this.explanation,
      type: this.type,
      points: this.points
    };
  }

  static fromJSON(json) {
    return new Question(json);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Lesson,
    Section,
    Exercise,
    Quiz,
    Question
  };
}