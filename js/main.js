/**
 * ============================================================================
 * DSA Playground - Core Engine (main.js)
 * Theme toggle, offline progress tracking, roadmap synchronization
 * Zero external dependencies, pure vanilla JS (C++ teacher friendly)
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Topic Catalog Definition
  // --------------------------------------------------------------------------
  const TOPICS = [
    {
      id: 'arrays',
      num: 1,
      title: 'Arrays',
      desc: 'Contiguous blocks of memory holding elements accessed by index.',
      difficulty: 'Beginner',
      time: '15 min',
      path: 'topics/arrays.html'
    },
    {
      id: 'linked-lists',
      num: 2,
      title: 'Linked Lists',
      desc: 'Chains of dynamically allocated nodes connected by pointers (singly & doubly).',
      difficulty: 'Beginner',
      time: '20 min',
      path: 'topics/linked-lists.html'
    },
    {
      id: 'stacks',
      num: 3,
      title: 'Stacks',
      desc: 'Last-In, First-Out (LIFO) pile with instant push, pop, and top inspection.',
      difficulty: 'Beginner',
      time: '15 min',
      path: 'topics/stacks.html'
    },
    {
      id: 'queues',
      num: 4,
      title: 'Queues & Deques',
      desc: 'First-In, First-Out (FIFO) lines, circular buffers, and double-ended queues.',
      difficulty: 'Beginner',
      time: '20 min',
      path: 'topics/queues.html'
    },
    {
      id: 'hashing',
      num: 5,
      title: 'Hashing & Hash Tables',
      desc: 'Blazing fast key-value lookups with collision resolution (chaining & probing).',
      difficulty: 'Intermediate',
      time: '25 min',
      path: 'topics/hashing.html'
    },
    {
      id: 'trees',
      num: 6,
      title: 'Trees & BST',
      desc: 'Hierarchical node branching, In/Pre/Post traversals, and Binary Search Trees.',
      difficulty: 'Intermediate',
      time: '30 min',
      path: 'topics/trees.html'
    },
    {
      id: 'heaps',
      num: 7,
      title: 'Heaps & Priority Queues',
      desc: 'Complete binary tree arrays maintaining Min/Max heap properties.',
      difficulty: 'Intermediate',
      time: '25 min',
      path: 'topics/heaps.html'
    },
    {
      id: 'graphs',
      num: 8,
      title: 'Graphs & Traversal',
      desc: 'Interconnected networks represented via matrices/lists with BFS and DFS.',
      difficulty: 'Advanced',
      time: '35 min',
      path: 'topics/graphs.html'
    },
    {
      id: 'sorting',
      num: 9,
      title: 'Sorting Algorithms',
      desc: 'Compare and race Bubble, Selection, Insertion, Merge, and Quick Sort.',
      difficulty: 'Intermediate',
      time: '30 min',
      path: 'topics/sorting.html'
    },
    {
      id: 'searching',
      num: 10,
      title: 'Searching Algorithms',
      desc: 'Sequential Linear scan versus divide-and-conquer Binary search.',
      difficulty: 'Beginner',
      time: '15 min',
      path: 'topics/searching.html'
    }
  ];

  // Storage keys
  const STORAGE_KEY_PROGRESS = 'dsa_playground_progress';
  const STORAGE_KEY_THEME = 'dsa_playground_theme';
  const STORAGE_KEY_LAST = 'dsa_playground_last_topic';

  // --------------------------------------------------------------------------
  // 2. Safe LocalStorage Wrappers
  // --------------------------------------------------------------------------
  const Storage = {
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item !== null ? JSON.parse(item) : defaultValue;
      } catch (err) {
        console.warn('[DSA Playground] LocalStorage read failed:', err);
        return defaultValue;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (err) {
        console.warn('[DSA Playground] LocalStorage write failed:', err);
        return false;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (err) {
        console.warn('[DSA Playground] LocalStorage remove failed:', err);
        return false;
      }
    }
  };

  // --------------------------------------------------------------------------
  // 3. Theme Manager
  // --------------------------------------------------------------------------
  const Theme = {
    current: 'light',

    init() {
      // 1. Check saved choice, fallback to system preference
      const saved = Storage.get(STORAGE_KEY_THEME, null);
      if (saved === 'dark' || saved === 'light') {
        this.current = saved;
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.current = 'dark';
      } else {
        this.current = 'light';
      }
      this.apply();
      this.attachEvents();
    },

    apply() {
      document.documentElement.setAttribute('data-theme', this.current);
      const buttons = document.querySelectorAll('.theme-toggle-btn');
      buttons.forEach(btn => {
        btn.setAttribute('aria-label', `Switch to ${this.current === 'dark' ? 'light' : 'dark'} mode`);
        btn.innerHTML = this.current === 'dark'
          ? `<!-- Sun icon -->
             <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
          : `<!-- Moon icon -->
             <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      });
    },

    toggle() {
      this.current = this.current === 'dark' ? 'light' : 'dark';
      Storage.set(STORAGE_KEY_THEME, this.current);
      this.apply();
    },

    attachEvents() {
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('.theme-toggle-btn');
        if (btn) {
          this.toggle();
        }
      });
    }
  };

  // --------------------------------------------------------------------------
  // 4. Progress Tracking Engine
  // --------------------------------------------------------------------------
  const Progress = {
    getCompletedMap() {
      return Storage.get(STORAGE_KEY_PROGRESS, {}) || {};
    },

    isCompleted(topicId) {
      const map = this.getCompletedMap();
      return Boolean(map[topicId]);
    },

    setCompleted(topicId, isCompleted = true) {
      const map = this.getCompletedMap();
      if (isCompleted) {
        map[topicId] = true;
      } else {
        delete map[topicId];
      }
      Storage.set(STORAGE_KEY_PROGRESS, map);
      this.syncUI();
    },

    toggleCompleted(topicId) {
      const current = this.isCompleted(topicId);
      this.setCompleted(topicId, !current);
      return !current;
    },

    getLastTopic() {
      return Storage.get(STORAGE_KEY_LAST, 'arrays');
    },

    setLastTopic(topicId) {
      Storage.set(STORAGE_KEY_LAST, topicId);
    },

    reset() {
      Storage.remove(STORAGE_KEY_PROGRESS);
      Storage.remove(STORAGE_KEY_LAST);
      this.syncUI();
    },

    getStats() {
      const map = this.getCompletedMap();
      const completedCount = TOPICS.filter(t => Boolean(map[t.id])).length;
      const total = TOPICS.length;
      const percent = Math.round((completedCount / total) * 100);
      return { completedCount, total, percent };
    },

    syncUI() {
      // 1. Sync Landing Page Roadmap & Progress Bar (if present)
      const progressBar = document.getElementById('roadmap-progress-fill');
      const progressText = document.getElementById('roadmap-progress-text');
      const progressCount = document.getElementById('roadmap-progress-count');
      const continueBtn = document.getElementById('btn-continue-learning');

      const stats = this.getStats();

      if (progressBar) {
        progressBar.style.width = `${stats.percent}%`;
        progressBar.setAttribute('aria-valuenow', stats.percent);
      }
      if (progressText) {
        progressText.textContent = `${stats.percent}%`;
      }
      if (progressCount) {
        progressCount.textContent = `${stats.completedCount} of ${stats.total} topics completed`;
      }

      if (continueBtn) {
        // Find next incomplete topic, or fallback to last visited topic
        const map = this.getCompletedMap();
        const nextIncomplete = TOPICS.find(t => !map[t.id]);
        const targetTopic = nextIncomplete || TOPICS[0];
        continueBtn.href = targetTopic.path;
        continueBtn.textContent = stats.completedCount === stats.total 
          ? '🎉 All Done! Review Topics' 
          : `Continue: ${targetTopic.title} →`;
      }

      // Update roadmap item status classes on index.html
      TOPICS.forEach(topic => {
        const item = document.getElementById(`roadmap-item-${topic.id}`);
        if (item) {
          const completed = this.isCompleted(topic.id);
          const statusText = item.querySelector('.status-text');
          const statusIcon = item.querySelector('.status-icon');

          if (completed) {
            item.classList.add('completed');
            if (statusText) statusText.textContent = 'Completed';
            if (statusIcon) {
              statusIcon.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>`;
            }
          } else {
            item.classList.remove('completed');
            if (statusText) statusText.textContent = 'Start Topic';
            if (statusIcon) {
              statusIcon.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle><polyline points="12 8 16 12 12 16"></polyline><line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>`;
            }
          }
        }
      });

      // 2. Sync Topic Page completion toggle button (if present)
      const currentTopicId = document.body.dataset.topicId;
      if (currentTopicId) {
        const markBtn = document.getElementById('btn-mark-completed');
        if (markBtn) {
          const completed = this.isCompleted(currentTopicId);
          if (completed) {
            markBtn.classList.add('btn-completed');
            markBtn.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg> Completed! (Click to undo)`;
          } else {
            markBtn.classList.remove('btn-completed');
            markBtn.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
              </svg> Mark as Completed`;
          }
        }
      }
    }
  };

  // --------------------------------------------------------------------------
  // 5. Global API Export (attached to window for cross-page scripts)
  // --------------------------------------------------------------------------
  window.DSAPlayground = {
    topics: TOPICS,
    theme: Theme,
    progress: Progress,
    storage: Storage
  };

  // --------------------------------------------------------------------------
  // 6. DOM Initialization
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    Theme.init();
    Progress.syncUI();

    // Reset progress button handler
    const resetBtn = document.getElementById('btn-reset-progress');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to reset all your learning progress?')) {
          Progress.reset();
        }
      });
    }

    // Mark as completed button on topic pages
    const markBtn = document.getElementById('btn-mark-completed');
    const currentTopicId = document.body.dataset.topicId;
    if (markBtn && currentTopicId) {
      markBtn.addEventListener('click', () => {
        Progress.toggleCompleted(currentTopicId);
      });
      // Also register this topic as last visited
      Progress.setLastTopic(currentTopicId);
    }
  });

})();
