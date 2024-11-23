// Function to show the appropriate payment form
function showPaymentForm(method) {
  document.getElementById("card-form").style.display = method === "card" ? "block" : "none";
  document.getElementById("cod-form").style.display = method === "cod" ? "block" : "none";
}

// Function to handle payment completion
async function completePayment() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order_id');
  const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You must be logged in to view the checkout page.");
    window.location.href = "login.html";
    return;
  }

  const amount = parseFloat(document.getElementById("total-amount").textContent);

  const paymentData = {
    paymentMethod: selectedMethod,
    amount,
  };

  try {
    const response = await fetch(`http://localhost:3000/api/payment/${orderId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "Payment failed.");
      return;
    }

    // Redirect to feedback page with order ID
    alert("Payment successful! Redirecting to feedback...");
    window.location.href = `feedback.html?orderId=${orderId}`;
  } catch (error) {
    console.error("Error processing payment:", error);
    alert("An error occurred. Please try again.");
  }
}

// Function to load order details from the API
async function loadOrderDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const order_id_from_url = urlParams.get('order_id');
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You must be logged in to view the checkout page.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/order/${order_id_from_url}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      alert("Failed to fetch order information");
      window.location.href = 'checkout.html';
      throw new Error("Failed to fetch order info");
    }

    const { order_id, items, total } = await response.json();

    // Populate order details in the page
    const orderId = document.getElementById('order-id');
    const orderItemsBody = document.getElementById("order-items-body");
    const totalAmount = document.getElementById("total-amount");

    items.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.product_name}</td>
        <td>${item.quantity}</td>
        <td>$${item.price}</td>
      `;
      orderItemsBody.appendChild(row);
    });
    // Update total amount
    orderId.textContent = order_id;
    totalAmount.textContent = total;
  } catch (error) {
    console.error("Error loading order details:", error);
  }
}

// Load order details when the page loads
window.onload = function () {
  loadOrderDetails();
};
