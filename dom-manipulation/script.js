// Quotes array with text and category
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't watch the clock; do what it does. Keep going.", category: "Inspiration" },
  { text: "Success is not in what you have, but who you are.", category: "Wisdom" }
];

// Function to display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  const quoteText = document.getElementById("quoteText");
  const quoteCategory = document.getElementById("quoteCategory");

  if (quoteText && quoteCategory) {
    quoteText.textContent = `"${randomQuote.text}"`;
    quoteCategory.textContent = `Category: ${randomQuote.category}`;
  }
}

// Function to add a new quote dynamically
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newQuoteText && newQuoteCategory) {
    const newQuote = { text: newQuoteText, category: newQuoteCategory };
    quotes.push(newQuote);
    showRandomQuote();

    // Clear the input fields after adding
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please enter both quote text and category.");
  }
}

// Function to create and add the quote form dynamically
function createAddQuoteForm() {
  const formContainer = document.getElementById("addQuoteForm");

  const inputQuote = document.createElement("input");
  inputQuote.type = "text";
  inputQuote.id = "newQuoteText";
  inputQuote.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.type = "text";
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(inputQuote);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);
}

// Add event listener for the “Show New Quote” button
const showQuoteButton = document.getElementById("newQuote");
if (showQuoteButton) {
  showQuoteButton.addEventListener("click", showRandomQuote);
}

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  createAddQuoteForm();
  showRandomQuote();
});
