/**
 * WebCraft - Data Loader
 * Gère le chargement des données JSON (leçons, projets, etc.)
 */

class DataLoader {
    constructor() { this.cache = new Map(); this.basePath = ''; }

    setBasePath(path) { this.basePath = path; }

    async loadJSON(path) {
        if (this.cache.has(path)) return this.cache.get(path);
        try {
            const fullPath = this.basePath ? `${this.basePath}/${path}` : path;
            const response = await fetch(fullPath);
            if (!response.ok) throw new Error(`Erreur ${response.status} : Fichier non trouvé (${fullPath})`);
            const data = await response.json();
            if (!this.validateJSON(data)) throw new Error('Fichier JSON invalide');
            this.cache.set(path, data); return data;
        } catch (error) {
            console.error(`Erreur lors du chargement de ${path} :`, error); throw error;
        }
    }

    validateJSON(data) { return typeof data === 'object' && data !== null; }

    async loadCourses() { return this.loadJSON('data/courses.json'); }

    async loadLesson(lessonId) {
        const courses = await this.loadCourses();
        for (const module of courses.modules) {
            for (const lesson of module.lessons) {
                if (lesson.id === lessonId) return this.loadJSON(lesson.file);
            }
        }
        try { return this.loadJSON(`data/${lessonId}.json`); }
        catch (error) { throw new Error(`Leçon non trouvée : ${lessonId}`); }
    }

    async loadModuleLessons(moduleId) {
        const courses = await this.loadCourses();
        const module = courses.modules.find(m => m.id === moduleId);
        if (!module) throw new Error(`Module non trouvé : ${moduleId}`);
        const lessons = [];
        for (const lesson of module.lessons) {
            try { lessons.push(await this.loadJSON(lesson.file)); } catch (error) { console.error(`Erreur : ${lesson.id}`, error); }
        }
        return lessons;
    }

    async loadProjects() { return this.loadJSON('data/projects.json'); }

    async loadProject(projectId) {
        const projects = await this.loadProjects();
        const project = projects.projects.find(p => p.id === projectId);
        if (!project) throw new Error(`Projet non trouvé : ${projectId}`);
        return this.loadJSON(project.file);
    }

    async loadChallenge(challengeId) {
        const courses = await this.loadCourses();
        for (const module of courses.modules) {
            if (module.challenges) {
                for (const challenge of module.challenges) {
                    if (challenge.id === challengeId) return this.loadJSON(challenge.file);
                }
            }
        }
        try { return this.loadJSON(`data/${challengeId}.json`); }
        catch (error) { throw new Error(`Défi non trouvé : ${challengeId}`); }
    }

    async loadLessonSchema() { return this.loadJSON('data/lesson_schema.json'); }

    validateLessonBasic(lesson) {
        const requiredFields = ['metadata', 'sections'];
        for (const field of requiredFields) if (!(field in lesson)) { console.error(`Champ manquant : ${field}`); return false; }
        const metadataRequired = ['id', 'title', 'category'];
        for (const field of metadataRequired) if (!(field in lesson.metadata)) { console.error(`Champ manquant : ${field}`); return false; }
        if (!Array.isArray(lesson.sections) || lesson.sections.length === 0) { console.error('Sections invalides'); return false; }
        for (const section of lesson.sections) if (!('type' in section) || !('id' in section)) { console.error('Section invalide'); return false; }
        return true;
    }

    async loadMultiple(paths) { const promises = paths.map(path => this.loadJSON(path)); return Promise.all(promises); }
    clearCache() { this.cache.clear(); }
    async preload(paths) { for (const path of paths) try { await this.loadJSON(path); } catch (error) { console.error(`Préchargement : ${path}`, error); } }
}

const dataLoader = new DataLoader();
if (typeof module !== 'undefined' && module.exports) { module.exports = { DataLoader, dataLoader }; }
else { window.WebCraft = window.WebCraft || {}; window.WebCraft.DataLoader = DataLoader; window.WebCraft.dataLoader = dataLoader; }