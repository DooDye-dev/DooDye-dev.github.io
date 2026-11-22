/**
 * Storage utilities for managing localStorage operations
 */

const StorageUtils = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  has: (key) => {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error('Error checking localStorage:', error);
      return false;
    }
  },

  keys: () => {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  },

  getAll: () => {
    try {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        items[key] = value ? JSON.parse(value) : null;
      }
      return items;
    } catch (error) {
      console.error('Error getting all localStorage items:', error);
      return {};
    }
  },

  removeByPrefix: (prefix) => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
          i--;
        }
      }
    } catch (error) {
      console.error('Error removing items by prefix:', error);
    }
  },

  getUsage: () => {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        total += key.length + value.length;
      }
      return total * 2;
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return 0;
    }
  },

  isAvailable: () => {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  },

  getRemainingSpace: () => {
    try {
      const limit = 5 * 1024 * 1024;
      const used = this.getUsage();
      return limit - used;
    } catch (error) {
      console.error('Error calculating remaining space:', error);
      return 0;
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageUtils;
}