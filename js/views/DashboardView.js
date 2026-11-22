/**
 * DashboardView - Handles the user dashboard with progress tracking
 */

class DashboardView {
  constructor(userProgress, coursesData) {
    this.userProgress = userProgress;
    this.coursesData = coursesData;
    this.init();
  }

  init() {
    this.renderDashboard();
    this.setupEventListeners();
  }

  renderDashboard() {
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;
    dashboard.innerHTML = '';
    this.renderUserStats(dashboard);
    this.renderProgressOverview(dashboard);
    this.renderCourseProgress(dashboard);
    this.renderRecentActivity(dashboard);
    this.renderBadges(dashboard);
  }

  renderUserStats(dashboard) {
    const statsContainer = document.createElement('section');
    statsContainer.className = 'dashboard-section user-stats';
    const title = document.createElement('h2');
    title.textContent = 'Tes statistiques';
    const statsGrid = document.createElement('div');
    statsGrid.className = 'stats-grid';

    const xpStat = this.createStatCard('XP Total', this.userProgress.getTotalXP(), 'xp-icon', 'xp');
    const levelStat = this.createStatCard('Niveau', this.userProgress.getLevel(), 'level-icon', 'level');
    const lessonsStat = this.createStatCard('Leçons terminées', this.userProgress.getCompletedLessons().length, 'lesson-icon', 'lessons');
    const quizzesStat = this.createStatCard('Quiz réussis', this.userProgress.getPassedQuizzes().length, 'quiz-icon', 'quizzes');
    const exercisesStat = this.createStatCard('Exercices validés', this.userProgress.getCompletedExercises().length, 'exercise-icon', 'exercises');

    statsGrid.append(xpStat, levelStat, lessonsStat, quizzesStat, exercisesStat);
    statsContainer.append(title, statsGrid);
    dashboard.appendChild(statsContainer);
  }

  createStatCard(label, value, iconClass, dataType) {
    const card = document.createElement('div');
    card.className = `stat-card ${dataType}`;
    const icon = document.createElement('div');
    icon.className = `stat-icon ${iconClass}`;
    const valueEl = document.createElement('div');
    valueEl.className = 'stat-value';
    valueEl.textContent = value;
    const labelEl = document.createElement('div');
    labelEl.className = 'stat-label';
    labelEl.textContent = label;
    card.append(icon, valueEl, labelEl);
    return card;
  }

  renderProgressOverview(dashboard) {
    const progressContainer = document.createElement('section');
    progressContainer.className = 'dashboard-section progress-overview';
    const title = document.createElement('h2');
    title.textContent = 'Progression globale';
    const progressBarContainer = document.createElement('div');
    progressBarContainer.className = 'progress-bar-container';
    const progressLabel = document.createElement('div');
    progressLabel.className = 'progress-label';
    const totalLessons = this.countTotalLessons();
    const completedLessons = this.userProgress.getCompletedLessons().length;
    const percentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    progressLabel.textContent = `${completedLessons}/${totalLessons} leçons`;
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.width = `${percentage}%`;
    progressBar.appendChild(progressFill);
    progressBarContainer.append(progressLabel, progressBar);
    progressContainer.append(title, progressBarContainer);
    dashboard.appendChild(progressContainer);
  }

  countTotalLessons() {
    let count = 0;
    this.coursesData.courses.forEach(course => { course.modules.forEach(module => { count += module.lessons.length; }); });
    return count;
  }

  renderCourseProgress(dashboard) {
    const courseContainer = document.createElement('section');
    courseContainer.className = 'dashboard-section course-progress';
    const title = document.createElement('h2');
    title.textContent = 'Progression par module';
    const coursesList = document.createElement('div');
    coursesList.className = 'courses-list';
    this.coursesData.courses.forEach(course => { const courseCard = this.createCourseProgressCard(course); coursesList.appendChild(courseCard); });
    courseContainer.append(title, coursesList);
    dashboard.appendChild(courseContainer);
  }

  createCourseProgressCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    const header = document.createElement('div');
    header.className = 'course-header';
    const title = document.createElement('h3');
    title.textContent = course.title;
    const description = document.createElement('p');
    description.className = 'course-description';
    description.textContent = course.description;
    header.append(title, description);
    const modulesList = document.createElement('div');
    modulesList.className = 'modules-list';
    course.modules.forEach(module => { const moduleCard = this.createModuleProgressCard(course.id, module); modulesList.appendChild(moduleCard); });
    card.append(header, modulesList);
    return card;
  }

  createModuleProgressCard(courseId, module) {
    const card = document.createElement('div');
    card.className = 'module-card';
    const header = document.createElement('div');
    header.className = 'module-header';
    const title = document.createElement('h4');
    title.textContent = module.title;
    const totalLessons = module.lessons.length;
    const completedLessons = this.userProgress.getCompletedLessonsInModule(courseId, module.id).length;
    const percentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    const progressText = document.createElement('span');
    progressText.className = 'module-progress-text';
    progressText.textContent = `${completedLessons}/${totalLessons}`;
    header.append(title, progressText);
    const progressBar = document.createElement('div');
    progressBar.className = 'module-progress-bar';
    const progressFill = document.createElement('div');
    progressFill.className = 'module-progress-fill';
    progressFill.style.width = `${percentage}%`;
    progressBar.appendChild(progressFill);
    const lessonsList = document.createElement('div');
    lessonsList.className = 'module-lessons';
    module.lessons.forEach(lesson => { const lessonItem = this.createLessonItem(courseId, module.id, lesson); lessonsList.appendChild(lessonItem); });
    card.append(header, progressBar, lessonsList);
    return card;
  }

  createLessonItem(courseId, moduleId, lesson) {
    const item = document.createElement('div');
    item.className = 'lesson-item';
    const link = document.createElement('a');
    link.href = `lesson.html?lesson=${lesson.id}`;
    const title = document.createElement('span');
    title.className = 'lesson-title';
    title.textContent = lesson.title;
    const statusIcon = document.createElement('span');
    statusIcon.className = 'lesson-status';
    const isCompleted = this.userProgress.isLessonCompleted(lesson.id);
    const isStarted = this.userProgress.isLessonStarted(lesson.id);
    if (isCompleted) { statusIcon.textContent = '✓'; statusIcon.className = 'lesson-status completed'; item.classList.add('completed'); }
    else if (isStarted) { statusIcon.textContent = '→'; statusIcon.className = 'lesson-status in-progress'; item.classList.add('in-progress'); }
    else { statusIcon.textContent = '○'; statusIcon.className = 'lesson-status not-started'; item.classList.add('not-started'); }
    link.append(title, statusIcon); item.appendChild(link);
    return item;
  }

  renderRecentActivity(dashboard) {
    const activityContainer = document.createElement('section');
    activityContainer.className = 'dashboard-section recent-activity';
    const title = document.createElement('h2');
    title.textContent = 'Activité récente';
    const activityList = document.createElement('div');
    activityList.className = 'activity-list';
    const recentActivities = this.userProgress.getRecentActivity(10);
    if (recentActivities.length === 0) {
      const emptyMessage = document.createElement('p'); emptyMessage.className = 'empty-message'; emptyMessage.textContent = 'Aucune activité récente.';
      activityList.appendChild(emptyMessage);
    } else {
      recentActivities.forEach(activity => { const activityItem = this.createActivityItem(activity); activityList.appendChild(activityItem); });
    }
    activityContainer.append(title, activityList);
    dashboard.appendChild(activityContainer);
  }

  createActivityItem(activity) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    const date = document.createElement('span');
    date.className = 'activity-date';
    date.textContent = new Date(activity.timestamp).toLocaleDateString('fr-FR');
    const description = document.createElement('span');
    description.className = 'activity-description';
    switch (activity.type) {
      case 'lesson_started': description.textContent = `A commencé : ${activity.lessonTitle}`; break;
      case 'lesson_completed': description.textContent = `A terminé : ${activity.lessonTitle}`; break;
      case 'exercise_completed': description.textContent = `A validé un exercice dans : ${activity.lessonTitle}`; break;
      case 'quiz_passed': description.textContent = `A réussi un quiz dans : ${activity.lessonTitle}`; break;
      default: description.textContent = activity.description || activity.type;
    }
    item.append(date, description);
    return item;
  }

  renderBadges(dashboard) {
    const badgesContainer = document.createElement('section');
    badgesContainer.className = 'dashboard-section badges-section';
    const title = document.createElement('h2');
    title.textContent = 'Tes badges';
    const badgesGrid = document.createElement('div');
    badgesGrid.className = 'badges-grid';
    const userBadges = this.userProgress.getBadges();
    if (userBadges.length === 0) {
      const emptyMessage = document.createElement('p'); emptyMessage.className = 'empty-message'; emptyMessage.textContent = 'Aucun badge encore.';
      badgesGrid.appendChild(emptyMessage);
    } else {
      userBadges.forEach(badge => { const badgeElement = this.createBadgeElement(badge); badgesGrid.appendChild(badgeElement); });
    }
    badgesContainer.append(title, badgesGrid);
    dashboard.appendChild(badgesContainer);
  }

  createBadgeElement(badge) {
    const badgeEl = document.createElement('div');
    badgeEl.className = `badge-element ${badge.type}`;
    badgeEl.title = badge.description;
    const icon = document.createElement('div');
    icon.className = 'badge-icon';
    icon.textContent = badge.icon || '🏆';
    const name = document.createElement('div');
    name.className = 'badge-name';
    name.textContent = badge.name;
    const date = document.createElement('div');
    date.className = 'badge-date';
    date.textContent = new Date(badge.date).toLocaleDateString('fr-FR');
    badgeEl.append(icon, name, date);
    return badgeEl;
  }

  setupEventListeners() { const refreshBtn = document.getElementById('refresh-dashboard'); if (refreshBtn) { refreshBtn.addEventListener('click', () => { this.renderDashboard(); }); } }
}

if (typeof module !== 'undefined' && module.exports) { module.exports = DashboardView; }