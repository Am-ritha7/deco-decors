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
  const token = localStorage.getItem("token");// Assuming user_id is stored in localStorage
  if (!token) {
    alert("You must be logged in to add items to the cart.");
    return;
  }
  try {
    const response = await fetch("http://localhost:3000/api/cart", {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }); // Use correct API endpoint

    if (!response.ok) {
      throw new Error("Failed to fetch cart items");
    }
    const cartData = await response.json();

    cartData.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><img src="${item.image_url}" alt="${item.name}" class="cart-item-image" /></td>
        <td>${item.name}</td>
        <td>$${item.price}</td>
        <td>#${item.quantity}</td>
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
function checkout() {
  window.location.href = 'checkout.html';
}

// Logout function to clear token and reload page
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// Initialize the page on load
window.onload = initializeCartPage;
