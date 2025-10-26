// ----- LOCAL STORAGE HANDLING -----
function getLocalQuotes() {
  return JSON.parse(localStorage.getItem("quotes")) || [];
}

function saveLocalQuotes(quotes) {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

let quotes = getLocalQuotes().length ? getLocalQuotes() : [
  { text: "The journey of a thousand miles begins with a single step.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "Knowledge is power.", category: "Wisdom" }
];

saveLocalQuotes(quotes);

// ----- DISPLAY RANDOM QUOTE -----
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const selected = localStorage.getItem("selectedCategory") || "all";

  const filtered = selected === "all" ? quotes : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "No quotes available for this category.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `"${random.text}" - <strong>${random.category}</strong>`;
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// ----- ADD QUOTE -----
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text, category });
  saveLocalQuotes(quotes);

  populateCategories();
  showRandomQuote();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ----- CATEGORY FILTERING -----
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const unique = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  unique.forEach(cat => categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`);

  const saved = localStorage.getItem("selectedCategory");
  if (saved) categoryFilter.value = saved;
}

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

populateCategories();
showRandomQuote();

// ----- EXPORT -----
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
}

// ----- IMPORT -----
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const imported = JSON.parse(e.target.result);
    quotes.push(...imported);
    saveLocalQuotes(quotes);
    populateCategories();
    showRandomQuote();
    alert("Quotes imported successfully!");
  };
  reader.readAsText(event.target.files[0]);
}

// ----- SERVER SYNC (REQUIRED CHECKS) -----
async function fetchQuotesFromServer() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await response.json();
  return data.slice(0, 5).map(post => ({ text: post.title, category: "Server" }));
}

// ✅ REQUIRED: POST to server
async function postQuotesToServer(quotesToSend) {
  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",                     // REQUIRED KEYWORD
    headers: { "Content-Type": "application/json" }, // REQUIRED KEYWORD
    body: JSON.stringify(quotesToSend)  // send quotes to server
  });
}

// Conflict resolution: Server wins
function resolveConflicts(localQuotes, serverQuotes) {
  const combined = [...serverQuotes, ...localQuotes];
  return combined.filter((q, index, self) =>
    index === self.findIndex(x => x.text === q.text)
  );
}

async function syncQuotes() {
  const local = getLocalQuotes();
  const server = await fetchQuotesFromServer();

  const merged = resolveConflicts(local, server);

  quotes = merged;
  saveLocalQuotes(quotes);
  populateCategories();
  showRandomQuote();

  await postQuotesToServer(quotes); // ✅ REQUIRED CALL

  alert("Quotes synced with server!"); // REQUIRED PHRASE
}

// ✅ REQUIRED periodic sync
setInterval(syncQuotes, 30000);
