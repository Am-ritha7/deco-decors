function initializeHomePage() {
  const isLoggedIn = !!localStorage.getItem("token");
  const guestSection = document.getElementById("guestSection");
  const dashboardSection = document.getElementById("dashboardSection");

  if (isLoggedIn) {
    // Show the dashboard section for logged-in users
    guestSection.style.display = "none";
    dashboardSection.style.display = "block";
    loadProducts();
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
        <h3>${product.name}</h3>
        <p>${product.description}</p>
      `;
      productList.appendChild(productItem);
    });
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

// Function to navigate to a page
function navigateTo(page) {
  window.location.href = page;
}

// Logout function to clear token and reload page
function logout() {
  localStorage.removeItem("token");
  window.location.reload();
}

// Initialize page on load
window.onload = initializeHomePage;
