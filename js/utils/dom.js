/**
 * DOM utilities for common DOM operations
 */

const DOMUtils = {
  create: (tag, options = {}, children = []) => {
    const element = document.createElement(tag);

    if (options.attributes) {
      for (const [key, value] of Object.entries(options.attributes)) {
        element.setAttribute(key, value);
      }
    }

    if (options.className) {
      if (Array.isArray(options.className)) {
        element.classList.add(...options.className);
      } else {
        element.className = options.className;
      }
    }

    if (options.id) {
      element.id = options.id;
    }

    if (options.dataset) {
      for (const [key, value] of Object.entries(options.dataset)) {
        element.dataset[key] = value;
      }
    }

    if (options.style) {
      Object.assign(element.style, options.style);
    }

    if (options.text) {
      element.textContent = options.text;
    }

    if (options.html) {
      element.innerHTML = options.html;
    }

    this.appendChildren(element, children);
    return element;
  },

  appendChildren: (parent, children) => {
    if (!children) return;

    if (Array.isArray(children)) {
      children.forEach(child => {
        if (typeof child === 'string') {
          parent.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement || child instanceof Node) {
          parent.appendChild(child);
        }
      });
    } else if (typeof children === 'string') {
      parent.appendChild(document.createTextNode(children));
    } else if (children instanceof HTMLElement || children instanceof Node) {
      parent.appendChild(children);
    }
  },

  clear: (element) => {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },

  remove: (element) => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  },

  show: (element) => {
    if (element) {
      element.style.display = '';
    }
  },

  hide: (element) => {
    if (element) {
      element.style.display = 'none';
    }
  },

  toggle: (element) => {
    if (element) {
      element.style.display = element.style.display === 'none' ? '' : 'none';
    }
  },

  addClass: (element, className) => {
    if (element) {
      if (Array.isArray(className)) {
        element.classList.add(...className);
      } else {
        element.classList.add(className);
      }
    }
  },

  removeClass: (element, className) => {
    if (element) {
      if (Array.isArray(className)) {
        element.classList.remove(...className);
      } else {
        element.classList.remove(className);
      }
    }
  },

  toggleClass: (element, className) => {
    if (element) {
      element.classList.toggle(className);
    }
  },

  hasClass: (element, className) => {
    return element ? element.classList.contains(className) : false;
  },

  get: (id) => {
    return document.getElementById(id);
  },

  query: (selector, parent = document) => {
    return parent.querySelector(selector);
  },

  queryAll: (selector, parent = document) => {
    return parent.querySelectorAll(selector);
  },

  createModal: (options = {}) => {
    const modal = document.createElement('div');
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    if (options.title) {
      const title = document.createElement('h2');
      title.className = 'modal-title';
      title.textContent = options.title;
      modalContent.appendChild(title);
    }

    if (options.content) {
      if (typeof options.content === 'string') {
        const content = document.createElement('div');
        content.className = 'modal-body';
        content.innerHTML = options.content;
        modalContent.appendChild(content);
      } else if (options.content instanceof HTMLElement) {
        modalContent.appendChild(options.content);
      }
    }

    if (options.buttons && options.buttons.length > 0) {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'modal-buttons';

      options.buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.className = button.className || 'btn';
        btn.textContent = button.text;
        btn.addEventListener('click', () => {
          if (button.callback) button.callback();
          if (button.close !== false) modal.remove();
        });
        buttonContainer.appendChild(btn);
      });

      modalContent.appendChild(buttonContainer);
    }

    if (options.closeButton !== false) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'modal-close';
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', () => {
        modal.remove();
      });
      modalContent.appendChild(closeBtn);
    }

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    if (options.closeOnOutsideClick !== false) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
    }

    if (options.closeOnEscape !== false) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          modal.remove();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
    }

    return {
      element: modal,
      show: () => {},
      hide: () => { modal.remove(); },
      destroy: () => { modal.remove(); }
    };
  },

  showNotification: (options = {}) => {
    const notification = document.createElement('div');
    notification.className = `notification ${options.type || 'info'}`;

    const message = document.createElement('span');
    message.className = 'notification-message';
    message.textContent = options.message || '';

    notification.appendChild(message);
    document.body.appendChild(notification);

    const timeout = options.timeout || 3000;
    setTimeout(() => {
      notification.classList.add('notification-exit');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, timeout);

    return notification;
  },

  showLoading: (message = 'Chargement...', parent = document.body) => {
    const loading = document.createElement('div');
    loading.className = 'loading';

    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';

    const text = document.createElement('span');
    text.className = 'loading-text';
    text.textContent = message;

    loading.append(spinner, text);
    parent.appendChild(loading);
    return loading;
  },

  hideLoading: (loadingElement) => {
    if (loadingElement) {
      loadingElement.remove();
    }
  },

  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  escapeHtml: (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  sanitizeHtml: (html) => {
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
    html = html.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
    return html;
  },

  isInViewport: (element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  scrollTo: (element, options = {}) => {
    element.scrollIntoView({
      behavior: options.behavior || 'smooth',
      block: options.block || 'start',
      inline: options.inline || 'nearest'
    });
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMUtils;
}