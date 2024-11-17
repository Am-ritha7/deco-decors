// Sample data - in a real application, fetch this from the server or local storage
let cartItems = [
    { id: 1, name: "Product 1", price: 25.00, quantity: 2 },
    { id: 2, name: "Product 2", price: 40.00, quantity: 1 }
];

// Display cart items in the summary section
function displayCartItems() {
    const cartItemsContainer = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");
    cartItemsContainer.innerHTML = "";

    let total = 0;

    cartItems.forEach(item => {
        total += item.price * item.quantity;

        const itemDiv = document.createElement("div");
        itemDiv.classList.add("cart-item");
        itemDiv.innerHTML = `
            <p>${item.name} - $${item.price.toFixed(2)} x ${item.quantity}</p>
            <p>Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    totalPriceElement.innerText = `Total: $${total.toFixed(2)}`;
}

// Handle placing the order
function placeOrder() {
    const shippingForm = document.getElementById("shipping-form");
    const paymentForm = document.getElementById("payment-form");

    if (!shippingForm.checkValidity() || !paymentForm.checkValidity()) {
        alert("Please fill in all required fields.");
        return;
    }

    // Mock order submission
    alert("Order placed successfully!");

    // In a real application, you would send the order data to the server here
    // Example:
    // fetch('/api/orders', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ cartItems, shippingDetails, paymentDetails })
    // });
}

// Load cart items on page load
window.onload = displayCartItems;
