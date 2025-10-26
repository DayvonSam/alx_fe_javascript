let quotes = [
  { text: "Success is not final; failure is not fatal.", category: "Motivation" },
  { text: "The only limit to our realization of tomorrow is our doubts today.", category: "Inspiration" },
  { text: "Happiness depends upon ourselves.", category: "Life" }
];

// Load from storage if available
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}
loadQuotes();

/* -------- SAVE QUOTES -------- */
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

/* -------- DISPLAY RANDOM QUOTE -------- */
function displayRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const selectedCategory = localStorage.getItem("selectedCategory") || "all";

  let filtered = quotes;
  if (selectedCategory !== "all") {
    filtered = quotes.filter(q => q.category === selectedCategory);
  }

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes in this category.</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const randomQuote = filtered[randomIndex];

  quoteDisplay.innerHTML = `<p>"${randomQuote.text}"</p><small>Category: ${randomQuote.category}</small>`;
}

/* Button Listener */
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);

/* -------- POPULATE CATEGORY DROPDOWN -------- */
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  // Extract unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
  }
}
populateCategories();

/* -------- FILTER QUOTES FUNCTION -------- */
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;

  // Save selected category to local storage
  localStorage.setItem("selectedCategory", selectedCategory);

  displayRandomQuote();
}

/* -------- ADD QUOTE FORM -------- */
function createAddQuoteForm() {
  const container = document.getElementById("addQuoteContainer");
  container.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;

  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}
createAddQuoteForm();

/* -------- ADD NEW QUOTE -------- */
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text === "" || category === "") {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  displayRandomQuote();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

/* -------- EXPORT QUOTES -------- */
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

/* -------- IMPORT QUOTES -------- */
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
    displayRandomQuote();
  };
  fileReader.readAsText(event.target.files[0]);
}

/* -------- INITIAL DISPLAY -------- */
displayRandomQuote();
