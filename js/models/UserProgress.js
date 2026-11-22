/**
 * WebCraft - UserProgress Model
 * Gère la progression de l'utilisateur, les badges, les XP, etc.
 */

class UserProgress {
    constructor() {
        this.data = {
            user: {
                id: this.generateUserId(),
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                preferences: { theme: 'light', language: 'fr', fontSize: 'medium' }
            },
            progress: {
                completedLessons: [],
                completedExercises: {},
                quizScores: {},
                completedProjects: [],
                completedChallenges: [],
                currentLesson: null,
                currentSection: null
            },
            stats: {
                totalXP: 0, level: 1, timeSpent: 0,
                badges: [], streak: 0,
                lastActivity: new Date().toISOString()
            }
        };
        this.storageKey = 'webcraft_progress';
    }

    generateUserId() {
        return 'user-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    async load() {
        const savedData = localStorage.getItem(this.storageKey);
        if (savedData) {
            try {
                this.data = JSON.parse(savedData);
                this.data.user.lastLogin = new Date().toISOString();
                this.checkStreak();
                this.save();
            } catch (error) {
                console.error('Erreur lors du chargement:', error);
                this.reset();
            }
        }
        return this;
    }

    save() {
        try { localStorage.setItem(this.storageKey, JSON.stringify(this.data)); }
        catch (error) { console.error('Erreur lors de la sauvegarde:', error); }
    }

    reset() {
        this.data = {
            user: { id: this.generateUserId(), createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(), preferences: { theme: 'light', language: 'fr', fontSize: 'medium' } },
            progress: { completedLessons: [], completedExercises: {}, quizScores: {}, completedProjects: [], completedChallenges: [], currentLesson: null, currentSection: null },
            stats: { totalXP: 0, level: 1, timeSpent: 0, badges: [], streak: 0, lastActivity: new Date().toISOString() }
        };
        this.save();
    }

    checkStreak() {
        if (!this.data.stats.lastActivity) return;
        const lastActivityDate = new Date(this.data.stats.lastActivity);
        const today = new Date(); const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        if (lastActivityDate.toDateString() === yesterday.toDateString()) this.data.stats.streak += 1;
        else if (lastActivityDate.toDateString() !== today.toDateString()) this.data.stats.streak = 1;
    }

    updateLastActivity() { this.data.stats.lastActivity = new Date().toISOString(); this.save(); }

    completeLesson(lessonId, xp = 50) {
        if (!this.data.progress.completedLessons.includes(lessonId)) {
            this.data.progress.completedLessons.push(lessonId); this.addXP(xp);
            this.updateLastActivity(); this.save();
        }
    }

    isLessonCompleted(lessonId) { return this.data.progress.completedLessons.includes(lessonId); }

    updateCurrentLesson(lessonId, sectionId = null) {
        this.data.progress.currentLesson = lessonId; this.data.progress.currentSection = sectionId;
        this.updateLastActivity(); this.save();
    }

    getCurrentLesson() { return { lesson: this.data.progress.currentLesson, section: this.data.progress.currentSection }; }

    completeExercise(lessonId, exerciseId, xp = 30) {
        if (!this.data.progress.completedExercises[lessonId]) this.data.progress.completedExercises[lessonId] = [];
        if (!this.data.progress.completedExercises[lessonId].includes(exerciseId)) {
            this.data.progress.completedExercises[lessonId].push(exerciseId); this.addXP(xp);
            this.updateLastActivity(); this.save();
        }
    }

    isExerciseCompleted(lessonId, exerciseId) {
        return this.data.progress.completedExercises[lessonId] &&
               this.data.progress.completedExercises[lessonId].includes(exerciseId);
    }

    recordQuizScore(lessonId, score, xp = 20) {
        this.data.progress.quizScores[lessonId] = { score: score, attempts: (this.data.progress.quizScores[lessonId]?.attempts || 0) + 1, date: new Date().toISOString() };
        const scoreXP = Math.round(xp * (score / 100)); this.addXP(scoreXP);
        this.updateLastActivity(); this.save();
    }

    getQuizScore(lessonId) { return this.data.progress.quizScores[lessonId] || null; }

    completeProject(projectId, xp = 200) {
        if (!this.data.progress.completedProjects.includes(projectId)) {
            this.data.progress.completedProjects.push(projectId); this.addXP(xp);
            this.updateLastActivity(); this.save();
        }
    }

    isProjectCompleted(projectId) { return this.data.progress.completedProjects.includes(projectId); }

    completeChallenge(challengeId, xp = 100) {
        if (!this.data.progress.completedChallenges.includes(challengeId)) {
            this.data.progress.completedChallenges.push(challengeId); this.addXP(xp);
            this.updateLastActivity(); this.save();
        }
    }

    isChallengeCompleted(challengeId) { return this.data.progress.completedChallenges.includes(challengeId); }

    addXP(xp) {
        this.data.stats.totalXP += xp; this.checkLevelUp(); this.checkBadges(); this.save();
    }

    getTotalXP() { return this.data.stats.totalXP; }
    getLevel() { return this.data.stats.level; }

    checkLevelUp() {
        const levels = [
            { id: 'beginner', minXP: 0, maxXP: 499 },
            { id: 'intermediate', minXP: 500, maxXP: 1499 },
            { id: 'advanced', minXP: 1500, maxXP: 2999 },
            { id: 'expert', minXP: 3000, maxXP: Infinity }
        ];
        const currentLevel = this.data.stats.level; let newLevel = 1;
        for (let i = levels.length - 1; i >= 0; i--) {
            if (this.data.stats.totalXP >= levels[i].minXP) { newLevel = i + 1; break; }
        }
        if (newLevel !== currentLevel) {
            this.data.stats.level = newLevel; this.save();
            if (typeof window !== 'undefined' && window.WebCraft?.utils) {
                window.WebCraft.utils.showNotification(`Félicitations ! Niveau ${newLevel} atteint ! 🎉`, 'success', 5000);
            }
        }
    }

    getLevelInfo() {
        const levels = [
            { id: 'beginner', title: 'Débutant', minXP: 0, maxXP: 499, color: '#CD7F32' },
            { id: 'intermediate', title: 'Intermédiaire', minXP: 500, maxXP: 1499, color: '#A8A8A8' },
            { id: 'advanced', title: 'Avancé', minXP: 1500, maxXP: 2999, color: '#FFD700' },
            { id: 'expert', title: 'Expert', minXP: 3000, maxXP: Infinity, color: '#FF69B4' }
        ];
        return levels[this.data.stats.level - 1] || levels[0];
    }

    checkBadges() {
        const badgeDefinitions = [
            { id: 'beginner', title: 'Débutant', description: 'Première leçon terminée', icon: '🏆', color: '#CD7F32', requirements: { type: 'lesson', count: 1 } },
            { id: 'html-basics', title: 'Maître des bases HTML', description: 'Module 1 HTML terminé', icon: '🏆', color: '#3B82F6', requirements: { type: 'module', moduleId: 'module-1' } },
            { id: 'css-basics', title: 'Maître des bases CSS', description: 'Module 2 CSS terminé', icon: '🏆', color: '#8B5CF6', requirements: { type: 'module', moduleId: 'module-2' } },
            { id: 'quick-learner', title: 'Apprenant rapide', description: '5 leçons en moins de 30 min', icon: '⚡', color: '#F97316', requirements: { type: 'speed', lessons: 5, maxTime: 30 } },
            { id: 'perfectionist', title: 'Perfectionniste', description: '100% de réussite aux quiz', icon: '✨', color: '#8B5CF6', requirements: { type: 'quiz', successRate: 100, count: 5 } },
            { id: 'explorer', title: 'Explorateur', description: '5 défis bonus terminés', icon: '🗺️', color: '#F97316', requirements: { type: 'challenge', count: 5 } },
            { id: 'html-master', title: 'Maître HTML', description: 'Tous les modules HTML terminés', icon: '👨‍💻', color: '#3B82F6', requirements: { type: 'category', category: 'html' } },
            { id: 'css-master', title: 'Maître CSS', description: 'Tous les modules CSS terminés', icon: '👨‍💻', color: '#8B5CF6', requirements: { type: 'category', category: 'css' } },
            { id: 'fullstack', title: 'Développeur Full Stack', description: 'Tous les modules terminés', icon: '👨‍💻', color: '#FFD700', requirements: { type: 'all' } }
        ];

        badgeDefinitions.forEach(badgeDef => {
            if (!this.hasBadge(badgeDef.id) && this.checkBadgeRequirements(badgeDef.requirements)) {
                this.addBadge(badgeDef);
            }
        });
    }

    checkBadgeRequirements(requirements) {
        switch (requirements.type) {
            case 'lesson': return this.data.progress.completedLessons.length >= requirements.count;
            case 'module': return this.data.progress.completedLessons.some(l => l.startsWith(requirements.moduleId));
            case 'speed': return this.data.progress.completedLessons.length >= requirements.lessons;
            case 'quiz': const quizScores = Object.values(this.data.progress.quizScores); const perfectQuizzes = quizScores.filter(s => s.score >= requirements.successRate); return perfectQuizzes.length >= requirements.count;
            case 'challenge': return this.data.progress.completedChallenges.length >= requirements.count;
            case 'category': return this.data.progress.completedLessons.some(l => l.startsWith(requirements.category));
            case 'all': return this.data.progress.completedLessons.length >= 20;
            default: return false;
        }
    }

    addBadge(badge) {
        if (!this.hasBadge(badge.id)) {
            this.data.stats.badges.push(badge); this.save();
            if (typeof window !== 'undefined' && window.WebCraft?.utils) {
                window.WebCraft.utils.showNotification(`Nouveau badge : ${badge.title} ! ${badge.icon}`, 'success', 5000);
            }
        }
    }

    hasBadge(badgeId) { return this.data.stats.badges.some(b => b.id === badgeId); }
    getBadges() { return this.data.stats.badges; }

    addTimeSpent(minutes) { this.data.stats.timeSpent += minutes; this.save(); }
    getTimeSpent() { return this.data.stats.timeSpent; }
    getFormattedTimeSpent() {
        const minutes = this.data.stats.timeSpent; const hours = Math.floor(minutes / 60); const mins = minutes % 60;
        return hours > 0 ? (mins > 0 ? `${hours}h ${mins}m` : `${hours}h`) : `${mins}m`;
    }

    getCompletedLessonsCount() { return this.data.progress.completedLessons.length; }
    getCompletedExercisesCount() { return Object.values(this.data.progress.completedExercises).reduce((total, e) => total + e.length, 0); }
    getCompletedProjectsCount() { return this.data.progress.completedProjects.length; }
    getCompletedChallengesCount() { return this.data.progress.completedChallenges.length; }
    getAverageQuizScore() {
        const scores = Object.values(this.data.progress.quizScores);
        if (scores.length === 0) return 0;
        return Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
    }
    getStreak() { return this.data.stats.streak; }
    getData() { return this.data; }
    updatePreferences(preferences) { this.data.user.preferences = { ...this.data.user.preferences, ...preferences }; this.save(); }
    getPreferences() { return this.data.user.preferences; }
}

if (typeof module !== 'undefined' && module.exports) { module.exports = UserProgress; }