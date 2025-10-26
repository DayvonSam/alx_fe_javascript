// Quotes array with text and category properties
let quotes = [
  { text: "Be the change you wish to see in the world.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal.", category: "Motivation" },
  { text: "Happiness depends upon ourselves.", category: "Happiness" }
];

// Function to display a random quote (uses innerHTML)
function displayRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  document.getElementById("quoteDisplay").innerHTML =
    `"${quote.text}" <br><em>(${quote.category})</em>`;
}

// Function to add a new quote to the array and update the DOM
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text === "" || category === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });

  displayRandomQuote(); // Update displayed quote
}

// Event listener for Show New Quote button
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);

// Event listener for Add Quote button
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

// Display one quote when page loads
displayRandomQuote();
