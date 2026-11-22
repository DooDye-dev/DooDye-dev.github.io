/**
 * LessonsView - Handles the lessons catalog page
 */

class LessonsView {
  constructor(coursesData, userProgress) {
    this.coursesData = coursesData;
    this.userProgress = userProgress;
    this.init();
  }

  init() {
    this.renderLessonsPage();
    this.setupEventListeners();
  }

  renderLessonsPage() {
    const lessonsContainer = document.getElementById('lessons-container');
    if (!lessonsContainer) return;
    lessonsContainer.innerHTML = '';
    this.renderHeader(lessonsContainer);
    this.renderCourseNavigation(lessonsContainer);
    this.renderLessonsGrid(lessonsContainer);
  }

  renderHeader(container) {
    const header = document.createElement('header');
    header.className = 'lessons-header';
    const title = document.createElement('h1');
    title.textContent = 'Catalogue des leçons';
    const subtitle = document.createElement('p');
    subtitle.className = 'lessons-subtitle';
    subtitle.textContent = 'Choisis une leçon pour commencer à apprendre';
    header.append(title, subtitle);
    container.appendChild(header);
  }

  renderCourseNavigation(container) {
    const navContainer = document.createElement('nav');
    navContainer.className = 'course-nav';
    const navTitle = document.createElement('h2');
    navTitle.textContent = 'Modules';
    const navList = document.createElement('ul');
    navList.className = 'course-nav-list';
    const allItem = document.createElement('li');
    const allLink = document.createElement('button');
    allLink.className = 'course-nav-link active'; allLink.textContent = 'Tous'; allLink.dataset.courseId = 'all';
    allItem.appendChild(allLink); navList.appendChild(allItem);
    this.coursesData.courses.forEach(course => {
      const courseItem = document.createElement('li');
      const courseLink = document.createElement('button');
      courseLink.className = 'course-nav-link'; courseLink.textContent = course.title; courseLink.dataset.courseId = course.id;
      courseItem.appendChild(courseLink); navList.appendChild(courseItem);
    });
    navContainer.append(navTitle, navList); container.appendChild(navContainer);
  }

  renderLessonsGrid(container) {
    const grid = document.createElement('div');
    grid.className = 'lessons-grid'; grid.id = 'lessons-grid';
    this.renderAllLessons(grid);
    container.appendChild(grid);
  }

  renderAllLessons(grid) {
    grid.innerHTML = '';
    this.coursesData.courses.forEach(course => {
      const courseHeader = document.createElement('h2'); courseHeader.className = 'course-title'; courseHeader.textContent = course.title;
      grid.appendChild(courseHeader);
      course.modules.forEach(module => {
        const moduleHeader = document.createElement('h3'); moduleHeader.className = 'module-title'; moduleHeader.textContent = module.title;
        grid.appendChild(moduleHeader);
        module.lessons.forEach(lesson => { const lessonCard = this.createLessonCard(lesson, course.id, module.id); grid.appendChild(lessonCard); });
      });
    });
  }

  createLessonCard(lesson, courseId, moduleId) {
    const card = document.createElement('div'); card.className = 'lesson-card'; card.dataset.courseId = courseId; card.dataset.moduleId = moduleId; card.dataset.lessonId = lesson.id;
    const link = document.createElement('a'); link.href = `lesson.html?lesson=${lesson.id}`; link.className = 'lesson-card-link';
    const header = document.createElement('div'); header.className = 'lesson-card-header';
    const title = document.createElement('h3'); title.className = 'lesson-card-title'; title.textContent = lesson.title;
    const levelBadge = document.createElement('span'); levelBadge.className = `badge level-${lesson.level.toLowerCase()}`; levelBadge.textContent = lesson.level;
    header.append(title, levelBadge);
    const body = document.createElement('div'); body.className = 'lesson-card-body';
    const description = document.createElement('p'); description.className = 'lesson-card-description'; description.textContent = lesson.description || '';
    const meta = document.createElement('div'); meta.className = 'lesson-card-meta';
    const duration = document.createElement('span'); duration.className = 'lesson-meta-item'; duration.innerHTML = '<i class="icon clock"></i> ' + (lesson.duration || '?') + ' min';
    const category = document.createElement('span'); category.className = 'lesson-meta-item'; category.innerHTML = '<i class="icon tag"></i> ' + lesson.category;
    meta.append(duration, category);
    body.append(description, meta);
    const footer = document.createElement('div'); footer.className = 'lesson-card-footer';
    const progressStatus = document.createElement('div'); progressStatus.className = 'lesson-progress-status';
    const isCompleted = this.userProgress.isLessonCompleted(lesson.id); const isStarted = this.userProgress.isLessonStarted(lesson.id);
    if (isCompleted) { progressStatus.innerHTML = '<i class="icon check"></i> Terminé'; progressStatus.className = 'lesson-progress-status completed'; card.classList.add('completed'); }
    else if (isStarted) { progressStatus.innerHTML = '<i class="icon play"></i> En cours'; progressStatus.className = 'lesson-progress-status in-progress'; card.classList.add('in-progress'); }
    else { progressStatus.innerHTML = '<i class="icon lock"></i> À commencer'; progressStatus.className = 'lesson-progress-status not-started'; card.classList.add('not-started'); }
    const xpReward = document.createElement('div'); xpReward.className = 'lesson-xp-reward'; xpReward.innerHTML = '<i class="icon star"></i> +' + (lesson.xp || 100);
    footer.append(progressStatus, xpReward);
    link.append(header, body, footer); card.appendChild(link);
    return card;
  }

  setupEventListeners() {
    const navLinks = document.querySelectorAll('.course-nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('active')); link.classList.add('active');
        const courseId = link.dataset.courseId; const lessonsGrid = document.getElementById('lessons-grid');
        if (courseId === 'all') this.renderAllLessons(lessonsGrid);
        else this.renderCourseLessons(lessonsGrid, courseId);
      });
    });
  }
}

if (typeof module !== 'undefined' && module.exports) { module.exports = LessonsView; }