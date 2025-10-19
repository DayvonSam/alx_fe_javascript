// Dynamic Quote Generator — Task 3 (Sync + Conflict Resolution)
// Save this as script.js in same folder as index.html

// ---------- Config & Storage Keys ----------
const STORAGE_KEY = 'dqg_quotes_v3';
const LAST_VIEWED_KEY = 'dqg_last_viewed_quote_v3';

// ---------- Elements ----------
const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const exportBtn = document.getElementById('exportJson');
const importInput = document.getElementById('importFile');
const resetBtn = document.getElementById('resetBtn');
const syncNowBtn = document.getElementById('syncNow');
const notification = document.getElementById('notification');
const conflictsBox = document.getElementById('conflictsBox');
const quotesList = document.getElementById('quotesList');

// ---------- In-memory data ----------
let quotes = []; // each quote: { id, text, category, updatedAt }

// ---------- Helpers ----------
function genId(){ return 'q_' + Math.random().toString(36).slice(2,9); }
function now(){ return Date.now(); }
function escapeHtml(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function showNotification(msg, ms=3500){
  notification.textContent = msg;
  notification.style.display = 'block';
  clearTimeout(notification._t);
  notification._t = setTimeout(()=> notification.style.display='none', ms);
}
function showConflictsList(items){
  if(!items || items.length===0){ conflictsBox.style.display='none'; return; }
  conflictsBox.style.display='block';
  conflictsBox.innerHTML = `<strong>Conflicts / Resolved</strong>
    <div class="small">Server entries took precedence for the following items or new server items were added:</div>
    <ul style="margin:8px 0 0 18px">${items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
}

// ---------- Persist & Load ----------
function saveQuotes(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  }catch(e){
    console.error('Failed to save quotes', e);
  }
}
function loadQuotes(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw){
    // seed data
    quotes = [
      { id: genId(), text: 'The best way to predict the future is to invent it.', category:'Inspiration', updatedAt: now() },
      { id: genId(), text: 'Do one thing every day that scares you.', category:'Motivation', updatedAt: now() },
      { id: genId(), text: 'Stay hungry, stay foolish.', category:'Wisdom', updatedAt: now() }
    ];
    saveQuotes();
    return;
  }
  try{
    const parsed = JSON.parse(raw);
    if(Array.isArray(parsed)) {
      // normalize: ensure ids and updatedAt exist
      quotes = parsed.map(q => ({
        id: q.id || genId(),
        text: q.text || '',
        category: q.category || 'uncategorized',
        updatedAt: q.updatedAt || now()
      }));
    } else {
      console.warn('Stored quotes are not an array, resetting to seed.');
      localStorage.removeItem(STORAGE_KEY);
      loadQuotes();
    }
  } catch(err){
    console.error('Failed to parse stored quotes', err);
    localStorage.removeItem(STORAGE_KEY);
    loadQuotes();
  }
}

// ---------- UI Rendering ----------
function populateCategories(){
  const cats = Array.from(new Set(quotes.map(q=>q.category || 'uncategorized')));
  categoryFilter.innerHTML = '';
  const allOpt = document.createElement('option');
  allOpt.value='all'; allOpt.textContent='All Categories';
  categoryFilter.appendChild(allOpt);
  cats.forEach(c=>{
    const o = document.createElement('option');
    o.value = c; o.textContent = c[0].toUpperCase() + c.slice(1);
    categoryFilter.appendChild(o);
  });
  const lastFilter = localStorage.getItem('dqg_last_filter_v3');
  if(lastFilter) categoryFilter.value = lastFilter;
}

function renderQuotesList(){
  quotesList.innerHTML = '';
  if(!quotes || quotes.length===0){
    quotesList.innerHTML = '<em>No quotes stored.</em>';
    return;
  }
  // newest first
  const list = quotes.slice().sort((a,b)=>b.updatedAt - a.updatedAt);
  list.forEach(q=>{
    const card = document.createElement('div');
    card.className = 'quote-card';
    card.innerHTML = `<div>
        <div>${escapeHtml(q.text)}</div>
        <div class="meta">${escapeHtml(q.category)} • ${new Date(q.updatedAt).toLocaleString()}</div>
      </div>`;
    const actions = document.createElement('div');
    actions.style.display='flex'; actions.style.flexDirection='column'; actions.style.gap='6px';
    const showBtn = document.createElement('button'); showBtn.textContent='Show'; showBtn.className='ghost';
    showBtn.onclick = ()=> displayRandomQuote(q.id);
    const delBtn = document.createElement('button'); delBtn.textContent='Delete'; delBtn.className='ghost';
    delBtn.onclick = ()=>{
      if(!confirm('Delete this quote?')) return;
      quotes = quotes.filter(x=>x.id !== q.id);
      saveQuotes(); populateCategories(); renderQuotesList();
      // clear session stored if it was this quote
      const last = sessionStorage.getItem(LAST_VIEWED_KEY);
      if(last && last === q.id) sessionStorage.removeItem(LAST_VIEWED_KEY);
      showNotification('Quote deleted');
    };
    actions.appendChild(showBtn); actions.appendChild(delBtn);
    card.appendChild(actions);
    quotesList.appendChild(card);
  });
}

// ---------- Core functions (display, add, filter) ----------

// displayRandomQuote: show random or a specific id; uses innerHTML
function displayRandomQuote(forceId){
  const displayEl = quoteDisplay;
  if(!quotes || quotes.length===0){
    displayEl.innerHTML = '<em>No quotes available.</em>';
    return;
  }

  let quoteToShow = null;
  if(forceId){
    quoteToShow = quotes.find(q=>q.id === forceId) || null;
  } else {
    // apply filter
    const sel = categoryFilter.value || 'all';
    const pool = sel === 'all' ? quotes : quotes.filter(q=>q.category === sel);
    if(pool.length === 0){
      displayEl.innerHTML = '<em>No quotes for selected category.</em>';
      return;
    }
    const idx = Math.floor(Math.random() * pool.length);
    quoteToShow = pool[idx];
  }

  if(!quoteToShow){
    displayEl.innerHTML = '<em>Quote not found.</em>';
    return;
  }

  // set session storage last viewed id
  try{ sessionStorage.setItem(LAST_VIEWED_KEY, quoteToShow.id); }catch(e){}

  displayEl.innerHTML = `"${escapeHtml(quoteToShow.text)}" — <strong>${escapeHtml(quoteToShow.category)}</strong>`;
}

// addQuote: validate, push, persist, re-render, show immediately
function addQuote(){
  const textInput = document.getElementById('newQuoteText');
  const catInput = document.getElementById('newQuoteCategory');
  const text = (textInput.value || '').trim();
  const category = (catInput.value || '').trim() || 'uncategorized';
  if(!text){
    alert('Please enter quote text.');
    return;
  }
  const newQ = { id: genId(), text, category, updatedAt: now() };
  quotes.push(newQ);
  saveQuotes();
  populateCategories();
  renderQuotesList();
  displayRandomQuote(newQ.id);
  textInput.value = ''; catInput.value = '';
  showNotification('Quote added');
}

// filterQuotes: persist last filter and show a random item in that category
function filterQuotes(){
  const sel = categoryFilter.value || 'all';
  localStorage.setItem('dqg_last_filter_v3', sel);
  displayRandomQuote();
}

// ---------- Import / Export ----------

function exportToJsonFile(){
  try{
    const content = JSON.stringify(quotes, null, 2);
    const blob = new Blob([content], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `dqg_quotes_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click(); a.remove();
    URL.revokeObjectURL(url);
    showNotification('Export started');
  }catch(err){
    console.error('Export failed',err); alert('Export failed');
  }
}

function importFromJsonFile(event){
  const file = event?.target?.files?.[0];
  if(!file){ alert('No file selected'); return; }
  const fr = new FileReader();
  fr.onload = (e)=>{
    try{
      const data = JSON.parse(e.target.result);
      if(!Array.isArray(data)){ alert('JSON must be an array'); return; }
      // normalize and merge: avoid exact-text duplicates; update if imported updatedAt newer
      const existingByText = new Map(quotes.map(q=>[q.text,q]));
      let added=0, updated=0;
      data.forEach(item=>{
        const text = (item.text||'').toString().trim();
        if(!text) return;
        const category = (item.category || 'uncategorized').toString();
        const updatedAt = item.updatedAt || now();
        const existing = existingByText.get(text);
        if(!existing){
          quotes.push({ id: item.id || genId(), text, category, updatedAt });
          added++;
        } else {
          if(updatedAt > (existing.updatedAt || 0)){
            existing.category = category;
            existing.updatedAt = updatedAt;
            updated++;
          }
        }
      });
      saveQuotes();
      populateCategories();
      renderQuotesList();
      showNotification(`Imported: ${added} added, ${updated} updated`);
      event.target.value = ''; // reset file input
    }catch(err){
      console.error('Import failed', err); alert('Import failed: ' + (err.message||err));
      event.target.value='';
    }
  };
  fr.onerror = ()=>{ alert('File read error'); event.target.value=''; };
  fr.readAsText(file);
}

// ---------- Server Sync Simulation & Conflict Resolution ----------

// Simulate fetching server quotes from JSONPlaceholder and merge.
// Strategy:
//  - Map server posts -> { text: title, category: 'Server', updatedAt: simulated }
//  - If server text equals local text:
//      - if server.updatedAt > local.updatedAt => server wins (replace category/updatedAt)
//      - else keep local
//  - If server text not present => add
// Return list of conflict/descriptions for UI.
async function syncWithServer(){
  try{
    const resp = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=6');
    if(!resp.ok) throw new Error('Network response not ok');
    const data = await resp.json();
    // create server quotes with simulated updatedAt values (slightly newer)
    const serverQuotes = data.map((p,i)=>({
      id: 'srv_' + p.id,
      text: p.title.slice(0,260),
      category: 'Server',
      updatedAt: now() - (1000 * 60 * i) // stagger times back
    }));

    // apply merge with server precedence when server.updatedAt > local.updatedAt
    const localByText = new Map(quotes.map(q=>[q.text, q]));
    const conflictMessages = [];

    serverQuotes.forEach(sq=>{
      const local = localByText.get(sq.text);
      if(local){
        if(sq.updatedAt > (local.updatedAt || 0)){
          // server wins -> update local record (keep local id? we can set to server id to show it's server origin)
          local.category = sq.category;
          local.updatedAt = sq.updatedAt;
          local.id = sq.id;
          conflictMessages.push(`Replaced local: "${local.text}" with server version`);
        } else {
          // keep local; but note the discrepancy
          conflictMessages.push(`Kept local for: "${local.text}" (local newer)`);
        }
      } else {
        // new server quote -> add
        quotes.push({ id: sq.id, text: sq.text, category: sq.category, updatedAt: sq.updatedAt });
        conflictMessages.push(`Added new server quote: "${sq.text}"`);
      }
    });

    saveQuotes();
    populateCategories();
    renderQuotesList();

    // show conflicts UI (summary)
    showConflictsList(conflictMessages);
    if(conflictMessages.length>0) showNotification('Sync completed — conflicts/changes handled');
    else showNotification('Sync completed — no changes');
    return conflictMessages;
  }catch(err){
    console.error('Sync failed', err);
    showNotification('Sync failed — see console');
    return null;
  }
}

// ---------- Reset ----------
function resetToSeed(){
  if(!confirm('Reset all local quotes to seed data? This clears saved quotes.')) return;
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(LAST_VIEWED_KEY);
  loadQuotes();
  populateCategories();
  renderQuotesList();
  displayRandomQuote();
  showNotification('Reset complete');
}

// ---------- Init & bindings ----------
function init(){
  loadQuotes();
  populateCategories();
  renderQuotesList();

  // restore last viewed quote id from session
  const lastId = sessionStorage.getItem(LAST_VIEWED_KEY);
  if(lastId){
    const found = quotes.find(q=>q.id === lastId);
    if(found) displayRandomQuote(found.id);
    else displayRandomQuote();
  } else {
    displayRandomQuote();
  }

  // event listeners
  newQuoteBtn.addEventListener('click', ()=> displayRandomQuote());
  addQuoteBtn.addEventListener('click', addQuote);
  exportBtn.addEventListener('click', exportToJsonFile);
  importInput.addEventListener('change', importFromJsonFile);
  resetBtn.addEventListener('click', resetToSeed);
  syncNowBtn.addEventListener('click', ()=> syncWithServer());

  // background periodic sync (every 2 minutes)
  setInterval(()=> {
    // only attempt when page is visible
    if(document.visibilityState === 'visible'){
      syncWithServer().catch(()=>{/*silent*/});
    }
  }, 1000 * 60 * 2);
}

init();
