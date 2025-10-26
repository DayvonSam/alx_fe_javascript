// Step 1: Quotes Array
let quotes = [
  { text: "Be the change you wish to see in the world.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal.", category: "Motivation" },
  { text: "Happiness depends upon ourselves.", category: "Happiness" }
];

// Step 2: Function to show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quoteDisplay = document.getElementById("quoteDisplay");
  const quote = quotes[randomIndex];

  quoteDisplay.textContent = `"${quote.text}" - (${quote.category})`;
}

// Step 3: Function to create Add Quote Form Dynamically
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
}

// Step 4: Function to add a new quote to the list
function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;

  if (text === "" || category === "") {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text, category });
  showRandomQuote();
}

// Step 5: Event Listener for "Show New Quote" Button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Initialize
showRandomQuote();
createAddQuoteForm();
