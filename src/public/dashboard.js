const statusOptions = [
  "Delivered",
  "Shipped",
  "Processing",
  "Payment Rejected",
  "Payment Processed",
];

// Load content dynamically based on the section clicked
function navigateTo(section) {
  const contentElement = document.getElementById("content");
  if (section === "orders") {
    loadOrders(contentElement);
  } else if (section === "payments") {
    loadPayments(contentElement);
  } else if (section === "users") {
    loadUsers(contentElement);
  } else if (section === "feedback") {
    loadFeedback(contentElement);
  } else {
    contentElement.innerHTML = `<p>Selected: ${section}</p>`;
  }
}

// Render Orders List
async function loadOrders(contentElement) {
  contentElement.innerHTML = `<h2>Order Status</h2>`;
  const orderList = document.createElement("ul");

  const orders = await getOrderStatus();

  orders.forEach((order) => {
    const orderItem = document.createElement("li");
    orderItem.className = "order-item";

    orderItem.innerHTML = `
    <div class="order-header">
      <h3>Order ID: ${order.id}</h3>
      <p>User: ${order.user_name} (ID: ${order.user_id})</p>
      <p>Status: <span class="order-status">${order.status}</span></p>
      <p>Date: ${order.date}</p>
      <!-- Fix: Pass the order.id as a string (with quotes around it) -->
      <button class="expand-btn" onclick="toggleOrderDetails('${order.id}')">View Details</button>
    </div>
    <div class="order-details" id="order-details-${order.id}" style="display: none;">
      ${order.products.map(product => `<p>${product.name} - Quantity: ${product.quantity}</p>`).join('')}
    </div>
    <div class="edit-status">
      <label for="status-${order.id}">Edit Status</label>
      <select id="status-${order.id}">
        ${statusOptions.map(status => `<option value="${status}" ${status === order.status ? 'selected' : ''}>${status}</option>`).join('')}
      </select>
      <button onclick="updateOrderStatus('${order.id}')">Save</button>
    </div>
  `;

    orderList.appendChild(orderItem);
  });

  contentElement.appendChild(orderList);
}

// Toggle order details visibility
function toggleOrderDetails(orderId) {
  console.log('Toggling order details for:', orderId);
  const details = document.getElementById(`order-details-${orderId}`);
  const btn = details.previousElementSibling.querySelector(".expand-btn");

  if (details.style.display === "none") {
    details.style.display = "block";
    btn.textContent = "Hide Details";
  } else {
    details.style.display = "none";
    btn.textContent = "View Details";
  }
}


// Update Order Status
function updateOrderStatus(orderId) {
  console.log("Updating status for Order ID:", orderId);  // Ensure orderId is a string
  const statusSelect = document.getElementById(`status-${orderId}`);
  const newStatus = statusSelect.value;

  // Optionally, update the status in the UI immediately (you can send this to the server later)
  const statusElement = document.querySelector(`#order-details-${orderId}`).previousElementSibling.querySelector(".order-status");
  statusElement.textContent = newStatus;

  // Optionally, send this update to the server:
  fetch(`http://localhost:3000/api//admin/order-status/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: newStatus })
  })
    .then(response => response.json())
    .then(data => {
      console.log("Status updated successfully:", data);
    })
    .catch(error => {
      console.error("Error updating status:", error);
    });
}


// Fetch order data from the API
async function getOrderStatus() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/admin/order-status"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch order data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching order data:", error);
    return [];
  }
}

async function loadPayments(contentElement) {
  contentElement.innerHTML = `<h2>Payment History</h2>`;
  const paymentList = document.createElement("div");
  paymentList.className = "payment-list";

  const payments = await getPayments();

  payments.forEach(payment => {
    const paymentCard = document.createElement("div");
    paymentCard.className = "payment-card";

    paymentCard.innerHTML = `
      <div class="payment-header">
        <h3>Payment ID: ${payment.payment_id}</h3>
        <p>User: ${payment.username} (ID: ${payment.user_id})</p>
        <p>Order ID: ${payment.order_id}</p>
        <p>Payment Method: ${payment.payment_method}</p>
        <p>Payment Confirmed At: ${payment.payment_confirmed_at}</p>
      </div>
    `;

    paymentList.appendChild(paymentCard);
  });

  contentElement.appendChild(paymentList);
}

// Fetch Payment History from API
async function getPayments() {
  try {
    const response = await fetch(`http://localhost:3000/api/admin/payments`, {
      method: "GET",
    });

    if (!response.ok) {
      alert("Failed to fetch payment information");
      throw new Error("Failed to fetch payment info");
    }

    return await response.json();
  } catch (err) {
    console.error("Error loading payments:", err);
  }

  return [];
}

// Load Users List
async function loadUsers(contentElement) {
  contentElement.innerHTML = `<h2>Users List</h2>`;

  const usersTable = document.createElement("table");
  usersTable.className = "users-table";

  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `
    <th>ID</th>
    <th>Username</th>
    <th>Name</th>
    <th>Phone Number</th>
    <th>Gender</th>
    <th>Email</th>
  `;
  usersTable.appendChild(headerRow);

  const users = await getUsers();

  users.forEach(user => {
    const userRow = document.createElement("tr");
    userRow.innerHTML = `
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td>${user.name}</td>
      <td>${user.phoneNo}</td>
      <td>${user.gender}</td>
      <td>${user.email}</td>
    `;
    usersTable.appendChild(userRow);
  });

  contentElement.appendChild(usersTable);
}

// Fetch users data from the API
async function getUsers() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/users", {
      method: "GET",
    });

    if (!response.ok) {
      alert("Failed to fetch user information");
      throw new Error("Failed to fetch users");
    }

    return await response.json();
  } catch (err) {
    console.error("Error loading users:", err);
  }

  return [];
}

// Render Feedback List
async function loadFeedback(contentElement) {
  contentElement.innerHTML = `<h2>Feedback List</h2>`;
  const feedbackTable = document.createElement("table");
  feedbackTable.className = "feedback-table";

  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `
    <th>Feedback ID</th>
    <th>Order ID</th>
    <th>User</th>
    <th>Rating</th>
    <th>Comments</th>
  `;
  feedbackTable.appendChild(headerRow);

  const feedbacks = await getFeedbacks();

  feedbacks.forEach(feedback => {
    const feedbackRow = document.createElement("tr");
    feedbackRow.innerHTML = `
      <td>${feedback.feedback_id}</td>
      <td>${feedback.order_id}</td>
      <td>${feedback.username}</td>
      <td>${feedback.rating}</td>
      <td>${feedback.comments}</td>
    `;
    feedbackTable.appendChild(feedbackRow);
  });

  contentElement.appendChild(feedbackTable);
}

// Fetch feedback data from the API
async function getFeedbacks() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/feedbacks", {
      method: "GET",
    });

    if (!response.ok) {
      alert("Failed to fetch feedback data");
      throw new Error("Failed to fetch feedbacks");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching feedback data:", error);
  }

  return [];
}


window.onload = () => navigateTo("orders");
