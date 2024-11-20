let cartItems = []; // Array to store products added to the cart

function initializeHomePage() {
  const isLoggedIn = !!localStorage.getItem("token");
  const guestSection = document.getElementById("guestSection");
  const dashboardSection = document.getElementById("dashboardSection");

  if (isLoggedIn) {
    // Show the dashboard section for logged-in users
    guestSection.style.display = "none";
    dashboardSection.style.display = "block";
    loadProducts();
    loadCartItems();
  } else {
    // Show the guest section for visitors
    guestSection.style.display = "block";
    dashboardSection.style.display = "none";
  }
}

async function loadProducts() {
  const productList = document.getElementById("productList");
  productList.innerHTML = ""; // Clear any existing content

  try {
    const response = await fetch("http://localhost:3000/api/products"); // Use correct API endpoint
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const products = await response.json();

    products.forEach(product => {
      const productItem = document.createElement("div");
      productItem.className = "product-item";
      productItem.innerHTML = `
        <img src="${product.image_url}" alt="${product.prod_name}" />
        <h3>${product.prod_name}</h3>
        <p>${product.description}</p>
        <p><strong>$${product.price}</strong></p>

        <button class="add-to-cart-btn" onclick="addToCart(${product.prod_id})">Add to Cart</button>
      `;
      productList.appendChild(productItem);
    });
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

async function loadCartItems() {
  const token = localStorage.getItem("token");// Assuming user_id is stored in localStorage
  if (!token) {
    logout();
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
      throw new Error("Failed to fetch cart");
    }
    const cart = await response.json();
    cartItems = [...cart];
    updateCartCount();
  } catch(err) {

  }
}

// Function to add product to the cart
async function addToCart(prodId) {
  const token = localStorage.getItem("token");// Assuming user_id is stored in localStorage
  if (!token) {
    alert("You must be logged in to add items to the cart.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/add-cart/${prodId}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to add item to cart");
    }

    const result = await response.json();
    cartItems = [...result];
    updateCartCount();
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert("Failed to add item to cart.");
  }
}

// Update the cart count (not used in the backend, but helpful for front-end display)
function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  cartCount.textContent = cartItems.length;
}

// Function to view cart (you can later implement the cart page)
function viewCart() {
  window.location.href = 'cart.html'
  // You can redirect to a cart page or show the cart items in a modal
}

function viewProfile() {
  alert("Viewing Profile");
  // You can redirect to a profile page
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id"); // Remove the user_id from localStorage when logging out
  window.location.reload();
}

function navigateTo(url) {
  window.location.href = url;
}

// Initialize page on load
window.onload = initializeHomePage;
