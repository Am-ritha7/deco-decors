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
  const token = localStorage.getItem("token"); // Assuming user_id is stored in localStorage
  if (!token) {
    alert("You must be logged in to add items to the cart.");
    return;
  }
  try {
    const response = await fetch("http://localhost:3000/api/cart", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }); // Use correct API endpoint

    if (!response.ok) {
      throw new Error("Failed to fetch cart items");
    }
    const cartData = await response.json();

    cartData.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><img src="${item.image_url}" alt="${item.name}" class="cart-item-image" /></td>
        <td>${item.name}</td>
        <td>$${item.price}</td>
        <td>#${item.quantity}</td>
        <td>
          <button class="btn-small add-btn" onclick="addItemToCart(${item.product_id})">+</button>
          <button class="btn-small remove-btn" onclick="removeItemFromCart(${item.product_id})">-</button>
        </td>
      `;

      cartItemsBody.appendChild(row);

      // Update total price
      totalPrice += (item.price * item.quantity);

    });

    // Update total price in the UI
    totalPriceElement.textContent = totalPrice.toFixed(2);
  } catch (error) {
    console.error("Error loading cart items:", error);
  }
}

// Function to remove an item from the cart
async function removeItemFromCart(productId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to modify the cart.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/remove-cart/${productId}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to remove item from cart");
    }

    // Reload the cart to update the UI
    loadCartItems();
  } catch (error) {
    console.error("Error removing item from cart:", error);
  }
}


// Function to add an item to the cart
async function addItemToCart(productId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to modify the cart.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/add-cart/${productId}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to add item to cart");
    }

    // Reload the cart to update the UI
    loadCartItems();
  } catch (error) {
    console.error("Error adding item to cart:", error);
  }
}


// Function to view the user profile
function viewProfile() {
  alert("Viewing Profile");
  // You can redirect to a profile page
}
function checkout() {
  window.location.href = "checkout.html";
}

// Logout function to clear token and reload page
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// Initialize the page on load
window.onload = initializeCartPage;
