// --- Local Storage Helpers ---
function getLocalQuotes() {
  return JSON.parse(localStorage.getItem("quotes")) || [];
}

function saveLocalQuotes(quotes) {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// --- Mock Server (Simulated Database) ---
let mockServerQuotes = [
  { text: "The only limit is your mind.", author: "Unknown", updatedAt: Date.now() }
];

// ✅ 1. Fetch quotes from “server”
async function fetchQuotesFromServer() {
  return new Promise(resolve => {
    setTimeout(() => resolve(mockServerQuotes), 500); // simulate network delay
  });
}

// ✅ 2. Post new quote to “server”
async function postQuoteToServer(quote) {
  return new Promise(resolve => {
    quote.updatedAt = Date.now();
    mockServerQuotes.push(quote);
    resolve(true);
  });
}

// ✅ Conflict Resolution (Keep newest quote version)
function resolveConflicts(localQuotes, serverQuotes) {
  const merged = [...localQuotes];

  serverQuotes.forEach(serverQuote => {
    const index = merged.findIndex(localQuote => localQuote.text === serverQuote.text);

    if (index === -1) {
      merged.push(serverQuote); // No conflict, just add
    } else {
      // Keep whichever was updated last
      if (serverQuote.updatedAt > merged[index].updatedAt) {
        merged[index] = serverQuote;
      }
    }
  });

  return merged;
}

// ✅ 3. Sync Function
async function syncQuotes() {
  const localQuotes = getLocalQuotes();
  const serverQuotes = await fetchQuotesFromServer();

  const merged = resolveConflicts(localQuotes, serverQuotes);

  saveLocalQuotes(merged);
  displayNotification("✅ Synced with server");
  renderQuotes();
}

// ✅ UI Notification
function displayNotification(message) {
  const notify = document.getElementById("notification");
  notify.innerText = message;
  notify.style.opacity = 1;

  setTimeout(() => (notify.style.opacity = 0), 2000);
}

// ✅ Render Quotes
function renderQuotes() {
  const list = document.getElementById("quoteList");
  const quotes = getLocalQuotes();

  list.innerHTML = quotes
    .map(q => `<li>"${q.text}" — <em>${q.author}</em></li>`)
    .join("");
}

// ✅ Add Quote
document.getElementById("addQuoteBtn").addEventListener("click", async () => {
  const text = document.getElementById("quoteInput").value;
  const author = document.getElementById("authorInput").value || "Unknown";

  if (!text.trim()) return;

  const newQuote = { text, author, updatedAt: Date.now() };

  // Save locally
  const quotes = getLocalQuotes();
  quotes.push(newQuote);
  saveLocalQuotes(quotes);

  // Send to server
  await postQuoteToServer(newQuote);

  renderQuotes();
  displayNotification("✨ Quote added and synced");
});

// ✅ Sync Automatically Every 10 Seconds
setInterval(syncQuotes, 10000);

// Initial Load
renderQuotes();
syncQuotes();
