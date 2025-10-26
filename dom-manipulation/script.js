// Quotes array
let quotes = [
  { text: "Be the change you wish to see in the world.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal.", category: "Motivation" },
  { text: "Happiness depends upon ourselves.", category: "Happiness" }
];

// Function to show a random quote (MUST be named showRandomQuote)
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  document.getElementById("quoteDisplay").innerHTML =
    `"${quote.text}" <br><em>(${quote.category})</em>`;
}

// Function to create the Add Quote form dynamically (MUST exist)
function createAddQuoteForm() {
  const container = document.getElementById("formContainer");

  // Create input for quote text
  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  // Create input for category
  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  // Create add button
  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  // Append elements to DOM
  container.appendChild(textInput);
  container.appendChild(categoryInput);
  container.appendChild(addButton);
}

// Function to add new quote and update DOM
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text === "" || category === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category }); // Add to array

  showRandomQuote(); // Update displayed quote
}

// Event listener for Show New Quote button (MUST exist)
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Initialize app
showRandomQuote();
createAddQuoteForm();
