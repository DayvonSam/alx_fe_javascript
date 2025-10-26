// Quotes array with text and category
let quotes = [
  { text: "Be the change you wish to see in the world.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal.", category: "Motivation" },
  { text: "Happiness depends upon ourselves.", category: "Happiness" }
];

// Function NAME must be showRandomQuote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  document.getElementById("quoteDisplay").innerHTML =
    `"${quote.text}" <br><em>(${quote.category})</em>`;
}

// Function to add new quote and update DOM
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text === "" || category === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });

  showRandomQuote(); // update DOM immediately
}

// Event listener for Show New Quote button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Event listener for add button
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

// Show one quote when page loads
showRandomQuote();

