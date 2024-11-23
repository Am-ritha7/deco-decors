// Fetch and display user details
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

      const user = await response.json();
      document.getElementById("userName").textContent = user.name;
      document.getElementById("userEmail").textContent = user.email;
      document.getElementById("userAddress").textContent = user.address;
    } catch (error) {
      console.error("Error loading user details:", error);
    }
  }

  // Fetch and display cart items
  async function loadCartItems() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to view the checkout page.");
      window.location.href = "login.html";
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/cart", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }

      const cartItems = await response.json();
      const cartItemsContainer = document.getElementById("cartItems");
      const totalPriceElement = document.getElementById("totalPrice");

      cartItemsContainer.innerHTML = ""; // Clear previous content
      let totalPrice = 0;

      cartItems.forEach((item) => {
        const subtotal = item.price * item.quantity;
        totalPrice += subtotal;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td><img src="${item.image_url}" alt="${item.name}" class="product-image"></td>
          <td>${item.name}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>${item.quantity}</td>
          <td>$${subtotal.toFixed(2)}</td>
        `;
        cartItemsContainer.appendChild(row);
      });

      // Update total price in the UI
      totalPriceElement.textContent = totalPrice.toFixed(2);
    } catch (error) {
      console.error("Error loading cart items:", error);
    }
  }

  // Confirm the order
  async function confirmOrder() {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to view the checkout page.");
      window.location.href = "login.html";
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }

      const { order_id } = await response.json();

      if(!order_id) {
        throw new error({ error: 'no order id'})
      }

      window.location.href = `payment.html?order_id=${order_id}`;

    } catch(err) {
      console.error("Error placing order:", error);
    }

  }

  // Logout function
  function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }

  // Initialize the checkout page on load
  window.onload = function () {
    loadUserDetails();
    loadCartItems();
  };
