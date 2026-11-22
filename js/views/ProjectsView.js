/**
 * ProjectsView - Handles the projects catalog page
 */

class ProjectsView {
  constructor(projectsData, userProgress) {
    this.projectsData = projectsData;
    this.userProgress = userProgress;
    this.init();
  }

  init() {
    this.renderProjectsPage();
    this.setupEventListeners();
  }

  renderProjectsPage() {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) return;
    projectsContainer.innerHTML = '';
    this.renderHeader(projectsContainer);
    this.renderFilters(projectsContainer);
    this.renderProjectsGrid(projectsContainer);
  }

  renderHeader(container) {
    const header = document.createElement('header');
    header.className = 'projects-header';
    const title = document.createElement('h1');
    title.textContent = 'Projets';
    const subtitle = document.createElement('p');
    subtitle.className = 'projects-subtitle';
    subtitle.textContent = 'Mets en pratique tes connaissances avec des projets concrets';
    header.append(title, subtitle);
    container.appendChild(header);
  }

  renderFilters(container) {
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'projects-filters';
    const filterTitle = document.createElement('h2');
    filterTitle.textContent = 'Filtres';
    const filtersList = document.createElement('div');
    filtersList.className = 'filters-list';
    const difficultyFilter = this.createFilterGroup('Difficulté', 'difficulty', [
      { value: 'all', label: 'Tous' }, { value: 'beginner', label: 'Débutant' }, { value: 'intermediate', label: 'Intermédiaire' }, { value: 'advanced', label: 'Avancé' }
    ]);
    const categoryFilter = this.createFilterGroup('Catégorie', 'category', [
      { value: 'all', label: 'Tous' }, { value: 'html', label: 'HTML' }, { value: 'css', label: 'CSS' }, { value: 'html-css', label: 'HTML + CSS' }, { value: 'responsive', label: 'Responsive' }
    ]);
    const statusFilter = this.createFilterGroup('Statut', 'status', [
      { value: 'all', label: 'Tous' }, { value: 'not-started', label: 'Non commencé' }, { value: 'in-progress', label: 'En cours' }, { value: 'completed', label: 'Terminé' }
    ]);
    filtersList.append(difficultyFilter, categoryFilter, statusFilter);
    filtersContainer.append(filterTitle, filtersList);
    container.appendChild(filtersContainer);
  }

  createFilterGroup(title, filterType, options) {
    const group = document.createElement('div'); group.className = 'filter-group'; group.dataset.filterType = filterType;
    const groupTitle = document.createElement('h3'); groupTitle.textContent = title;
    const optionsContainer = document.createElement('div'); optionsContainer.className = 'filter-options';
    options.forEach(option => {
      const optionEl = document.createElement('button');
      optionEl.className = `filter-option ${option.value === 'all' ? 'active' : ''}`;
      optionEl.textContent = option.label;
      optionEl.dataset.filterType = filterType;
      optionEl.dataset.value = option.value;
      optionsContainer.appendChild(optionEl);
    });
    group.append(groupTitle, optionsContainer);
    return group;
  }

  renderProjectsGrid(container) {
    const grid = document.createElement('div');
    grid.className = 'projects-grid';
    grid.id = 'projects-grid';
    this.projectsData.projects.forEach(project => { const projectCard = this.createProjectCard(project); grid.appendChild(projectCard); });
    container.appendChild(grid);
  }

  createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.projectId = project.id;
    card.dataset.difficulty = project.difficulty;
    card.dataset.category = project.category;
    const link = document.createElement('a');
    link.href = `editor.html?challenge=${project.id}`;
    link.className = 'project-card-link';
    const header = document.createElement('div');
    header.className = 'project-card-header';
    const title = document.createElement('h3');
    title.className = 'project-card-title';
    title.textContent = project.title;
    const badges = document.createElement('div');
    badges.className = 'project-badges';
    const difficultyBadge = document.createElement('span');
    difficultyBadge.className = `badge difficulty-${project.difficulty}`;
    difficultyBadge.textContent = this.getDifficultyLabel(project.difficulty);
    const categoryBadge = document.createElement('span');
    categoryBadge.className = `badge category-${project.category}`;
    categoryBadge.textContent = project.category;
    badges.append(difficultyBadge, categoryBadge);
    header.append(title, badges);
    const body = document.createElement('div');
    body.className = 'project-card-body';
    const description = document.createElement('p');
    description.className = 'project-card-description';
    description.textContent = project.description;
    const image = document.createElement('div');
    image.className = 'project-card-image';
    image.style.backgroundImage = project.image ? `url(${project.image})` : 'none';
    if (!project.image) { image.textContent = 'Aperçu'; image.className = 'project-card-image placeholder'; }
    body.append(description, image);
    const footer = document.createElement('div');
    footer.className = 'project-card-footer';
    const meta = document.createElement('div');
    meta.className = 'project-meta';
    const duration = document.createElement('span');
    duration.className = 'project-meta-item';
    duration.innerHTML = '<i class="icon clock"></i> ' + (project.duration || '?') + ' min';
    const xpReward = document.createElement('span');
    xpReward.className = 'project-meta-item';
    xpReward.innerHTML = '<i class="icon star"></i> +' + (project.xp || 200);
    meta.append(duration, xpReward);
    const status = document.createElement('div');
    status.className = 'project-status';
    const isCompleted = this.userProgress.isProjectCompleted(project.id);
    const isStarted = this.userProgress.isProjectStarted(project.id);
    if (isCompleted) { status.innerHTML = '<i class="icon check"></i> Terminé'; status.className = 'project-status completed'; card.classList.add('completed'); }
    else if (isStarted) { status.innerHTML = '<i class="icon play"></i> En cours'; status.className = 'project-status in-progress'; card.classList.add('in-progress'); }
    else { status.innerHTML = '<i class="icon lock"></i> À commencer'; status.className = 'project-status not-started'; card.classList.add('not-started'); }
    footer.append(meta, status);
    link.append(header, body, footer);
    card.appendChild(link);
    return card;
  }

  getDifficultyLabel(difficulty) {
    const labels = { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' };
    return labels[difficulty] || difficulty;
  }

  setupEventListeners() {
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
      option.addEventListener('click', () => {
        const filterType = option.dataset.filterType; const filterValue = option.dataset.value;
        document.querySelectorAll(`.filter-option[data-filter-type="${filterType}"]`).forEach(opt => { opt.classList.remove('active'); });
        option.classList.add('active');
        this.applyFilters();
      });
    });
  }

  applyFilters() {
    const activeFilters = {};
    document.querySelectorAll('.filter-option.active').forEach(option => { activeFilters[option.dataset.filterType] = option.dataset.value; });
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      let shouldShow = true;
      for (const [filterType, filterValue] of Object.entries(activeFilters)) {
        if (filterValue === 'all') continue;
        if (filterType === 'difficulty' && card.dataset.difficulty !== filterValue) { shouldShow = false; break; }
        else if (filterType === 'category' && card.dataset.category !== filterValue) { shouldShow = false; break; }
        else if (filterType === 'status') {
          const isCompleted = card.classList.contains('completed'); const isInProgress = card.classList.contains('in-progress'); const isNotStarted = card.classList.contains('not-started');
          if (filterValue === 'completed' && !isCompleted) { shouldShow = false; break; }
          else if (filterValue === 'in-progress' && !isInProgress) { shouldShow = false; break; }
          else if (filterValue === 'not-started' && !isNotStarted) { shouldShow = false; break; }
        }
      }
      card.style.display = shouldShow ? 'block' : 'none';
    });
  }
}

if (typeof module !== 'undefined' && module.exports) { module.exports = ProjectsView; }