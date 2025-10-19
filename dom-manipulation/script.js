// -------------------- INITIALIZATION --------------------
let quotes = [];
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn = document.getElementById("newQuote");

// Load quotes from localStorage on startup
window.onload = function () {
  const savedQuotes = localStorage.getItem("quotes");
  if (savedQuotes) {
    quotes = JSON.parse(savedQuotes);
  } else {
    // Default quotes
    quotes = [
      { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
      { text: "Do one thing every day that scares you.", category: "Motivation" },
      { text: "Stay hungry, stay foolish.", category: "Wisdom" }
    ];
    saveQuotes();
  }

  populateCategories();
  const lastCategory = localStorage.getItem("lastCategory");
  if (lastCategory) categoryFilter.value = lastCategory;

  filterQuotes();

  // Restore last viewed quote (session)
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) quoteDisplay.innerText = lastQuote;
};

// -------------------- CORE FUNCTIONS --------------------

// Save quotes array to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote from the selected filter
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  let filtered = quotes;
  if (selectedCategory !== "all") {
    filtered = quotes.filter(q => q.category === selectedCategory);
  }

  if (filtered.length === 0) {
    quoteDisplay.innerText = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  quoteDisplay.innerText = `"${quote.text}" - (${quote.category})`;

  // Save last viewed quote in sessionStorage
  sessionStorage.setItem("lastQuote", quoteDisplay.innerText);
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();

  textInput.value = "";
  categoryInput.value = "";

  populateCategories();
  filterQuotes();

  alert("Quote added successfully!");
}

// Populate categories dynamically
function populateCategories() {
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });
}

// Filter quotes by category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("lastCategory", selectedCategory);
  showRandomQuote();
}

// -------------------- IMPORT / EXPORT --------------------

// Export quotes to JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format!");
      }
    } catch {
      alert("Error reading JSON file!");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// -------------------- EVENT LISTENER --------------------
newQuoteBtn.addEventListener("click", showRandomQuote);

// -------------------- SERVER SYNC SIMULATION --------------------

// Simulate fetching data from a mock server (e.g., JSONPlaceholder)
async function syncWithServer() {
  try {
    // Mock fetch (replace with real API if available)
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=3");
    const serverData = await response.json();

    // Convert mock server data to quote format
    const serverQuotes = serverData.map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict resolution: server wins
    const mergedQuotes = [...serverQuotes, ...quotes];
    quotes = mergedQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();

    console.log("Synced with server successfully!");
  } catch (error) {
    console.error("Server sync failed:", error);
  }
}

// Sync every 60 seconds
setInterval(syncWithServer, 60000);
