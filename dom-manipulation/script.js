// script.js - corrected and hardened version

(function () {
  'use strict';

  // run after DOM ready to avoid null refs
  document.addEventListener('DOMContentLoaded', () => {
    // ----- Keys & defaults -----
    const STORAGE_KEY = 'dqg_quotes_v1';
    const FILTER_KEY = 'dqg_filter_v1';
    const LAST_QUOTE_KEY = 'dqg_lastquote_v1';

    const DEFAULT_QUOTES = [
      { id: genId(), text: 'Simplicity is the soul of efficiency.', category: 'productivity', ts: Date.now() },
      { id: genId(), text: 'Code is like humor. When you have to explain it, it’s bad.', category: 'coding', ts: Date.now() },
      { id: genId(), text: 'First, solve the problem. Then, write the code.', category: 'coding', ts: Date.now() },
      { id: genId(), text: 'Debugging is like being the detective in a crime movie where you are also the murderer.', category: 'coding', ts: Date.now() },
      { id: genId(), text: 'Do small things with great love.', category: 'life', ts: Date.now() },
    ];

    // ----- State -----
    let quotes = [];
    let serverSimulatedQuotes = [];
    let lastSyncAt = null;
    let syncIntervalId = null;

    // ----- DOM refs (queried after DOMContentLoaded) -----
    const quoteTextEl = document.getElementById('quoteText');
    const quoteCategoryEl = document.getElementById('quoteCategory');
    const newQuoteBtn = document.getElementById('newQuote');
    const addQuoteBtn = document.getElementById('addQuoteBtn');
    const newQuoteText = document.getElementById('newQuoteText');
    const newQuoteCategory = document.getElementById('newQuoteCategory');
    const exportJsonBtn = document.getElementById('exportJson');
    const importFileInput = document.getElementById('importFile');
    const importBtn = document.getElementById('importBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    const categoryList = document.getElementById('categoryList');
    const allQuotesList = document.getElementById('allQuotesList');
    const clearStorageBtn = document.getElementById('clearStorage');
    const notifyEl = document.getElementById('notify');
    const syncBtn = document.getElementById('syncBtn');
    const lastSyncEl = document.getElementById('lastSync');

    // Ensure required elements exist
    const required = [
      quoteTextEl, quoteCategoryEl, newQuoteBtn, addQuoteBtn,
      newQuoteText, newQuoteCategory, exportJsonBtn, importFileInput,
      importBtn, categoryFilter, categoryList, allQuotesList
    ];
    if (required.some(el => el === null)) {
      console.error('script.js: one or more required DOM elements are missing. Check index.html element IDs.');
      return;
    }

    // ----- Initialization -----
    function init() {
      loadQuotes();
      populateCategories();
      renderAllQuotes();

      const savedFilter = localStorage.getItem(FILTER_KEY) || 'all';
      if (Array.from(categoryFilter.options).some(o => o.value === savedFilter)) {
        categoryFilter.value = savedFilter;
      } else {
        categoryFilter.value = 'all';
      }

      attachEvents();

      // show last viewed quote if available in session storage
      const lastQ = sessionStorage.getItem(LAST_QUOTE_KEY);
      if (lastQ) {
        const q = quotes.find(x => x.id === lastQ);
        if (q) {
          showQuote(q);
        } else {
          showRandomQuote();
        }
      } else {
        showRandomQuote();
      }

      // start periodic sync simulation every 45 seconds
      if (syncIntervalId) clearInterval(syncIntervalId);
      syncIntervalId = setInterval(periodicSyncSimulation, 45_000);
    }

    function attachEvents() {
      newQuoteBtn.addEventListener('click', showRandomQuote);
      addQuoteBtn.addEventListener('click', onAddQuoteClicked);
      exportJsonBtn.addEventListener('click', exportToJson);
      importBtn.addEventListener('click', () => importFileInput.click());
      importFileInput.addEventListener('change', importFromJsonFile);
      categoryFilter.addEventListener('change', onFilterChange);
      clearStorageBtn.addEventListener('click', clearLocalStorage);
      syncBtn.addEventListener('click', () => periodicSyncSimulation(true));
    }

    // ----- Core functions -----
    function showRandomQuote() {
      const filtered = getFilteredQuotes();
      if (!filtered.length) {
        if (quoteTextEl) quoteTextEl.textContent = 'No quotes available for this category.';
        if (quoteCategoryEl) quoteCategoryEl.textContent = '';
        return;
      }
      const idx = Math.floor(Math.random() * filtered.length);
      const q = filtered[idx];
      showQuote(q);
    }

    function showQuote(q) {
      if (!q) return;
      quoteTextEl.textContent = q.text;
      quoteCategoryEl.textContent = q.category ? 'Category: ' + q.category : '';
      sessionStorage.setItem(LAST_QUOTE_KEY, q.id);
    }

    function addQuote(quoteObj) {
      if (!quoteObj || !String(quoteObj.text).trim()) return false;
      const newQ = {
        id: genId(),
        text: String(quoteObj.text).trim(),
        category: (quoteObj.category && String(quoteObj.category).trim()) || 'uncategorized',
        ts: Date.now()
      };
      quotes.push(newQ);
      saveQuotes();
      populateCategories();
      renderAllQuotes();
      notify('Quote added');
      return newQ;
    }

    function onAddQuoteClicked() {
      const t = newQuoteText.value.trim();
      const c = newQuoteCategory.value.trim() || 'uncategorized';
      if (!t) { alert('Please enter a quote text.'); return; }
      addQuote({ text: t, category: c });
      newQuoteText.value = '';
      newQuoteCategory.value = '';
    }

    function getUniqueCategories() {
      const set = new Set(quotes.map(q => q.category || 'uncategorized'));
      return Array.from(set).sort();
    }

    function populateCategories() {
      const cats = getUniqueCategories();
      // repopulate dropdown
      categoryFilter.innerHTML = '<option value="all">All Categories</option>' + cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
      // restore saved filter if present
      const saved = localStorage.getItem(FILTER_KEY) || 'all';
      if (['all', ...cats].includes(saved)) categoryFilter.value = saved;
      renderCategoryList(cats);
    }

    function renderCategoryList(cats) {
      if (!cats.length) categoryList.innerHTML = '<div class="note">No categories yet</div>';
      else categoryList.innerHTML = '<ul>' + cats.map(c => `<li>${escapeHtml(c)}</li>`).join('') + '</ul>';
    }

    function getFilteredQuotes() {
      const sel = categoryFilter.value || 'all';
      if (sel === 'all') return quotes.slice();
      return quotes.filter(q => q.category === sel);
    }

    function renderAllQuotes() {
      const list = getFilteredQuotes();
      if (!list.length) {
        allQuotesList.innerHTML = '<div class="note">No quotes to display</div>';
        return;
      }
      allQuotesList.innerHTML = list.map(q => `<li><strong>${escapeHtml(q.text)}</strong><div class="note">${escapeHtml(q.category)} — <small>${new Date(q.ts).toLocaleString()}</small></div></li>`).join('');
    }

    // ----- Storage -----
    function saveQuotes() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
      } catch (e) {
        console.error('Failed to save quotes', e);
        alert('Saving to localStorage failed. Storage quota might be full.');
      }
    }

    function loadQuotes() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        quotes = DEFAULT_QUOTES.map(q => ({ ...q })); // clone defaults
        saveQuotes();
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          // normalize entries: ensure id, text, category, ts
          quotes = parsed.map(item => ({
            id: item.id || genId(),
            text: String(item.text || item.quote || '').trim(),
            category: String(item.category || 'uncategorized').trim(),
            ts: item.ts || Date.now()
          })).filter(x => x.text);
          if (!quotes.length) {
            // fallback to defaults
            quotes = DEFAULT_QUOTES.map(q => ({ ...q }));
            saveQuotes();
          }
        } else {
          quotes = DEFAULT_QUOTES.map(q => ({ ...q }));
          saveQuotes();
        }
      } catch (e) {
        console.warn('Failed to parse stored quotes; resetting to defaults.', e);
        quotes = DEFAULT_QUOTES.map(q => ({ ...q }));
        saveQuotes();
      }
    }

    function clearLocalStorage() {
      if (!confirm('Clear local storage and reset quotes to defaults?')) return;
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(FILTER_KEY);
      sessionStorage.removeItem(LAST_QUOTE_KEY);
      loadQuotes();
      populateCategories();
      renderAllQuotes();
      notify('Local storage cleared');
    }

    // ----- JSON import/export -----
    function exportToJson() {
      try {
        const data = JSON.stringify(quotes, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const d = new Date();
        a.download = `quotes_export_${d.toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Export failed', err);
        alert('Export failed: ' + err.message);
      }
    }

    function importFromJsonFile(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const fr = new FileReader();
      fr.onload = function (ev) {
        try {
          const imported = JSON.parse(ev.target.result);
          if (!Array.isArray(imported)) throw new Error('Invalid JSON format: expected an array of quotes');
          const sanitized = imported.map(i => ({
            id: genId(),
            text: String(i.text || i.quote || '').trim(),
            category: String(i.category || 'uncategorized').trim(),
            ts: Date.now()
          })).filter(x => x.text);
          if (!sanitized.length) { alert('No valid quotes found in file.'); return; }
          quotes.push(...sanitized);
          saveQuotes();
          populateCategories();
          renderAllQuotes();
          notify('Quotes imported successfully');
        } catch (err) {
          console.error('Import failed', err);
          alert('Failed to import JSON: ' + (err && err.message ? err.message : 'unknown error'));
        } finally {
          // allow same file to be re-imported later
          try { e.target.value = ''; } catch (_) { /* ignore */ }
        }
      };
      fr.readAsText(file);
    }

    // ----- Sync simulation & conflict resolution -----
    function periodicSyncSimulation(force = false) {
      if (force) notify('Syncing...');
      simulateServerChange();
      const serverData = serverSimulatedQuotes.slice();
      const localById = new Map(quotes.map(q => [q.id, q]));
      // server wins on conflicts (simple strategy)
      serverData.forEach(s => { localById.set(s.id, { ...s }); });
      quotes = Array.from(localById.values()).sort((a, b) => a.ts - b.ts);
      saveQuotes();
      populateCategories();
      renderAllQuotes();
      lastSyncAt = new Date();
      if (lastSyncEl) lastSyncEl.textContent = lastSyncAt.toLocaleString();
      if (force) notify('Synced with server (simulated)');
    }

    function simulateServerChange() {
      // initialize server-side if empty
      if (!serverSimulatedQuotes.length) serverSimulatedQuotes = quotes.map(q => ({ ...q }));
      // randomly add or update a server quote ~30% chance
      if (Math.random() < 0.3) {
        const action = Math.random() < 0.6 ? 'update' : 'add';
        if (action === 'update' && serverSimulatedQuotes.length) {
          const idx = Math.floor(Math.random() * serverSimulatedQuotes.length);
          serverSimulatedQuotes[idx] = { ...serverSimulatedQuotes[idx], text: serverSimulatedQuotes[idx].text + ' (server edit)', ts: Date.now() };
        } else {
          serverSimulatedQuotes.push({ id: genId(), text: 'Server quote ' + Math.random().toString(36).slice(2, 8), category: 'server', ts: Date.now() });
        }
      }
    }

    // ----- Helpers -----
    function genId() { return 'q_' + Math.random().toString(36).slice(2, 9); }

    function escapeHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str).replace(/[&<>"']/g, function (m) {
        switch (m) {
          case '&': return '&amp;';
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '"': return '&quot;';
          case "'": return '&#39;';
          default: return m;
        }
      });
    }

    function notify(text, ms = 2200) {
      if (!notifyEl) return;
      notifyEl.textContent = text;
      notifyEl.style.display = 'block';
      setTimeout(() => { notifyEl.style.display = 'none'; }, ms);
    }

    function onFilterChange() {
      const v = categoryFilter.value;
      localStorage.setItem(FILTER_KEY, v);
      renderAllQuotes();
    }

    // expose small API for testing or grading environment
    window.DQG = {
      addQuote,
      showRandomQuote,
      getQuotes: () => quotes.slice(),
      saveQuotes
    };

    // run init
    init();
  }); // DOMContentLoaded

})();
