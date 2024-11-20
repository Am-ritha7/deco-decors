let cartItems = []; // Array to store cart items
let totalPrice = 0;

// Initialize the cart page
async function initializeCartPage() {
  const isLoggedIn = !!localStorage.getItem("token");

  if (!isLoggedIn) {
    // If not logged in, redirect to login page
    window.location.href = "login.html";
    return;
  }

  loadCartItems();
}

// Function to fetch cart items from the API
async function loadCartItems() {
  const cartItemsBody = document.getElementById("cartItemsBody");
  const totalPriceElement = document.getElementById("totalPrice");
  cartItemsBody.innerHTML = ""; // Clear any existing content
  totalPrice = 0;

  try {
    const response = await fetch("http://localhost:3000/api/cart"); // Use correct API endpoint
    if (!response.ok) {
      throw new Error("Failed to fetch cart items");
    }
    const cartData = await response.json();

    cartData.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><img src="${item.image_url}" alt="${item.prod_name}" class="cart-item-image" /></td>
        <td>${item.prod_name}</td>
        <td>$${item.price}</td>
        <td><input type="number" value="1" min="1" class="quantity-input" /></td>
      `;

      cartItemsBody.appendChild(row);

      // Update total price
      totalPrice += item.price;
    });

    // Update total price in the UI
    totalPriceElement.textContent = totalPrice.toFixed(2);
  } catch (error) {
    console.error("Error loading cart items:", error);
  }
}

// Function to navigate to the cart page
function viewCart() {
  alert("Viewing Cart");
  // You can redirect to a cart page or show the cart items in a modal
}

// Function to view the user profile
function viewProfile() {
  alert("Viewing Profile");
  // You can redirect to a profile page
}

// Logout function to clear token and reload page
function logout() {
  localStorage.removeItem("token");
  window.location.reload();
}

// Initialize the page on load
window.onload = initializeCartPage;
