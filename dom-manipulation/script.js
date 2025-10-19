// ========================================
// Dynamic Quote Generator - Task 0
// ========================================

// Array of quotes
let quotes = [
  {
    text: "The best way to get started is to quit talking and begin doing.",
    category: "Motivation",
  },
  {
    text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    category: "Inspiration",
  },
  {
    text: "Don’t let yesterday take up too much of today.",
    category: "Positivity",
  },
];

// ✅ Function: displayRandomQuote
function displayRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes available!</em>";
    return;
  }

  // ✅ Select a random quote
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // ✅ Update the DOM using innerHTML
  quoteDisplay.innerHTML = `"${randomQuote.text}" — <strong>${randomQuote.category}</strong>`;
}

// ✅ Function: addQuote
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newQuoteText === "" || newQuoteCategory === "") {
    alert("Please enter both quote text and category!");
    return;
  }

  // ✅ Add new quote to the array
  const newQuote = { text: newQuoteText, category: newQuoteCategory };
  quotes.push(newQuote);

  // ✅ Update the DOM (show the new quote)
  displayRandomQuote();

  // ✅ Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ✅ Event listener for the “Show New Quote” button
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);

// ✅ Display a random quote on initial load
window.onload = displayRandomQuote;
