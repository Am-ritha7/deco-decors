const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON body
app.use(express.json());

// In-memory cart (this should be replaced with a database in a real application)
let cart = [];

// Serve static files (like images or CSS) from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get the cart
app.get('/cart', (req, res) => {
  res.json(cart);
});

// Endpoint to add items to the cart
app.post('/cart', (req, res) => {
  const { id, name, imageUrl, offer, price, quantity } = req.body;
  if (!id || !name || !price || !quantity) {
    return res.status(400).json({ message: 'Invalid item data' });
  }

  const existingItem = cart.find((item) => item.id === id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ id, name, imageUrl, offer, price, quantity });
  }

  res.json({ message: 'Item added to cart', cart });
});

// Endpoint to clear the cart
app.post('/cart/clear', (req, res) => {
  cart = [];
  res.json({ message: 'Cart cleared' });
});

// Endpoint to checkout
app.post('/checkout', (req, res) => {
  if (cart.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  // Logic for processing checkout can be added here
  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  res.json({ message: 'Checkout successful', totalAmount });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
