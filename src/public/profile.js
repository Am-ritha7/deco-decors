// Load user profile
async function loadUserProfile() {
  const usernameElement = document.getElementById("username");
  const orderListElement = document.getElementById("orderList");
  const userDetails = await loadUserDetails();
  console.log(userDetails)
  const username = userDetails.name;
  usernameElement.textContent = username;
  const orders = await loadOrderStatus();
  // Dynamically load orders
  orders.forEach((order) => {
    const orderItem = document.createElement("li");
    orderItem.className = "product-item";
    orderItem.innerHTML = `
      <div class="product-header">
        <h3>Order ID: ${order.id}</h3>
        <button class="expand-btn">View Details</button>
      </div>
      <p>Status: <span class="order-status ${order.status.toLowerCase().split(' ').join('-')}">${
      order.status
    }</span></p>
      <p>Order Date: ${order.date}</p>
      <div class="product-details">
        ${order.products
          .map(
            (product) =>
              `<p>${product.name} - Quantity: ${product.quantity}</p>`
          )
          .join("")}
      </div>
    `;

    // Add event listener for expanding/collapsing product details
    const expandBtn = orderItem.querySelector(".expand-btn");
    const detailsSection = orderItem.querySelector(".product-details");
    expandBtn.addEventListener("click", () => {
      if (
        detailsSection.style.display === "none" ||
        !detailsSection.style.display
      ) {
        detailsSection.style.display = "flex";
        expandBtn.textContent = "Hide Details";
      } else {
        detailsSection.style.display = "none";
        expandBtn.textContent = "View Details";
      }
    });

    orderListElement.appendChild(orderItem);
  });
}

// Logout functionality
document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("token"); // Clear authentication token
  alert("You have been logged out.");
  window.location.href = "home.html"; // Redirect to home
});

async function loadOrderStatus() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You must be logged in to view the checkout page.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/order-status`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      alert("Failed to fetch order information");
      throw new Error("Failed to fetch order info");
    }

    return await response.json();
  } catch (err) {
    console.error("Error loading order:", err);
  }

  return [];
}


async function loadUserDetails() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You must be logged in to view the checkout page.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/user-info", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }

    return await response.json();

  } catch (error) {
    console.error("Error loading user details:", error);
  }

  return null;
}

// Initialize profile page
window.onload = loadUserProfile;
