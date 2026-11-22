/**
 * WebCraft - Main JavaScript File
 * Gère les fonctionnalités globales de l'application
 */

// ===================================================================
// INITIALISATION
// ===================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le thème
    initTheme();

    // Initialiser la navigation mobile
    initMobileNavigation();

    // Initialiser les animations au scroll
    initScrollAnimations();

    // Initialiser les tooltips
    initTooltips();

    // Initialiser les notifications
    initNotifications();
});

// ===================================================================
// THEME MANAGEMENT
// ===================================================================

/**
 * Initialise le thème (clair/sombre)
 */
function initTheme() {
    const themeToggleBtns = document.querySelectorAll('.theme-toggle');
    const savedTheme = localStorage.getItem('webcraft_theme') || 'light';

    // Appliquer le thème sauvegardé
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Ajouter l'icône appropriée au bouton
    updateThemeIcon(savedTheme);

    // Gérer les clics sur le bouton de thème
    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            // Appliquer le nouveau thème
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('webcraft_theme', newTheme);

            // Mettre à jour l'icône
            updateThemeIcon(newTheme);

            // Afficher une notification
            showNotification(`Thème changé en ${newTheme === 'dark' ? 'sombre' : 'clair'}`, 'info');
        });
    });
}

/**
 * Met à jour l'icône du bouton de thème
 * @param {string} theme - 'light' ou 'dark'
 */
function updateThemeIcon(theme) {
    const themeToggleBtns = document.querySelectorAll('.theme-toggle');
    themeToggleBtns.forEach(btn => {
        const svg = btn.querySelector('svg');
        if (svg) {
            if (theme === 'dark') {
                svg.innerHTML = `<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>`;
            } else {
                svg.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
            }
        }
    });
}

// ===================================================================
// MOBILE NAVIGATION
// ===================================================================

/**
 * Initialise la navigation mobile
 */
function initMobileNavigation() {
    const mobileMenuBtns = document.querySelectorAll('.mobile-menu-btn');
    const navbarNavs = document.querySelectorAll('.navbar-nav');

    mobileMenuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navbarNavs.forEach(nav => {
                nav.classList.toggle('active');
            });

            // Changer l'icône du bouton
            const svg = btn.querySelector('svg');
            if (svg) {
                if (navbarNavs[0].classList.contains('active')) {
                    svg.innerHTML = `<path d="M18 6L6 18M6 6l12 12"/>`;
                } else {
                    svg.innerHTML = `<path d="M3 12h18M3 6h18M3 18h18"/>`;
                }
            }
        });
    });

    // Fermer le menu si on clique à l'extérieur
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar') && !e.target.closest('.mobile-menu-btn')) {
            navbarNavs.forEach(nav => {
                nav.classList.remove('active');
            });

            // Réinitialiser l'icône
            mobileMenuBtns.forEach(btn => {
                const svg = btn.querySelector('svg');
                if (svg) {
                    svg.innerHTML = `<path d="M3 12h18M3 6h18M3 18h18"/>`;
                }
            });
        }
    });
}

// ===================================================================
// SCROLL ANIMATIONS
// ===================================================================

/**
 * Initialise les animations au scroll
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-fade-in-up, .animate-fade-in-down, .animate-slide-in-right, .animate-slide-in-left');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        animatedElements.forEach(el => {
            el.classList.remove('visible');
            observer.observe(el);
        });
    } else {
        animatedElements.forEach(el => el.classList.add('visible'));
    }
}

// ===================================================================
// TOOLTIPS
// ===================================================================

/**
 * Initialise les tooltips
 */
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');

    tooltipElements.forEach(el => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = el.getAttribute('data-tooltip');
        tooltip.style.position = 'absolute';
        tooltip.style.background = 'var(--color-text-primary)';
        tooltip.style.color = 'var(--color-surface)';
        tooltip.style.padding = 'var(--space-xs) var(--space-sm)';
        tooltip.style.borderRadius = 'var(--radius-sm)';
        tooltip.style.fontSize = 'var(--text-xs)';
        tooltip.style.zIndex = 'var(--z-tooltip)';
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
        tooltip.style.transition = 'all var(--transition-fast)';
        tooltip.style.whiteSpace = 'nowrap';

        el.style.position = 'relative';
        el.appendChild(tooltip);

        el.addEventListener('mouseenter', () => {
            const rect = el.getBoundingClientRect();
            tooltip.style.left = `${rect.width / 2 - tooltip.offsetWidth / 2}px`;
            tooltip.style.bottom = `${rect.height + 8}px`;
            tooltip.style.opacity = '1';
            tooltip.style.visibility = 'visible';
        });

        el.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'hidden';
        });
    });
}

// ===================================================================
// NOTIFICATIONS
// ===================================================================

/**
 * Initialise le système de notifications
 */
function initNotifications() {
    if (!document.getElementById('notification-container')) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = 'var(--z-modal)';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = 'var(--space-sm)';
        document.body.appendChild(container);
    }
}

/**
 * Affiche une notification
 * @param {string} message - Le message à afficher
 * @param {string} type - Type de notification : 'success', 'error', 'warning', 'info'
 * @param {number} duration - Durée en millisecondes (par défaut : 3000)
 */
function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.padding = 'var(--space-md) var(--space-lg)';
    notification.style.background = getNotificationColor(type);
    notification.style.color = 'white';
    notification.style.borderRadius = 'var(--radius-md)';
    notification.style.boxShadow = 'var(--shadow-lg)';
    notification.style.animation = 'slideInRight 0.3s ease forwards';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = 'var(--space-sm)';

    const icon = document.createElement('span');
    icon.className = 'notification-icon';
    icon.textContent = getNotificationIcon(type);
    notification.appendChild(icon);

    const messageEl = document.createElement('span');
    messageEl.textContent = message;
    notification.appendChild(messageEl);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'white';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '1.2rem';
    closeBtn.style.padding = '0';
    closeBtn.style.marginLeft = 'auto';
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    });
    notification.appendChild(closeBtn);

    container.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

/**
 * Retourne la couleur pour un type de notification
 * @param {string} type
 * @returns {string}
 */
function getNotificationColor(type) {
    const colors = {
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        info: 'var(--color-primary)'
    };
    return colors[type] || colors.info;
}

/**
 * Retourne l'icône pour un type de notification
 * @param {string} type
 * @returns {string}
 */
function getNotificationIcon(type) {
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

/**
 * Formate une durée en minutes en format lisible
 * @param {number} minutes
 * @returns {string}
 */
function formatDuration(minutes) {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Formate un nombre avec des séparateurs de milliers
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
    return new Intl.NumberFormat('fr-FR').format(num);
}

/**
 * Génère un ID unique
 * @returns {string}
 */
function generateUniqueId() {
    return 'id-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

/**
 * Copie du texte dans le presse-papiers
 * @param {string} text
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    }
}

// Exporter les fonctions
window.WebCraft = window.WebCraft || {};
window.WebCraft.utils = {
    showNotification, formatDuration, formatNumber,
    generateUniqueId, copyToClipboard
};