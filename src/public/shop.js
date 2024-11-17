// server.js
const express = require('express');
const cors = require('cors'); // Enables CORS for front-end to access backend

const app = express();
app.use(cors()); // Allow all origins (configure as needed)
app.use(express.json()); // Parse JSON bodies

// Sample in-memory database for products
const products = [
  {
    id: 1,
    name: "Product 1",
    description: "This is a description of product 1",
    price: 200,
    offer: "15% off",
    imageUrl: "http://localhost:3000/assets/imghm8.jpg",
  },
  {
    id: 2,
    name: "Product 2",
    description: "This is a description of product 2",
    price: 200,
    offer: "15% off",
    imageUrl: "http://localhost:3000/assets/imghm15.jpg" ,
  },
  {
    id: 3,
    name: "Product 3",
    description: "This is a description of product 3",
    price: 300,
    offer: "20% off",
    imageUrl: "http://localhost:3000/assets/imghm16.jpg",
  },
];

// In-memory cart data
let cart = [];

// Route to get products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Route to add a product to the cart
app.post('/api/cart', (req, res) => {
  const { productId } = req.body;
  const product = products.find((p) => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const cartItem = cart.find((item) => item.id === productId);
  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  res.json(cart);
});

// Route to adjust the quantity of a cart item
app.put('/api/cart/:productId', (req, res) => {
  const productId = parseInt(req.params.productId, 10);
  const { amount } = req.body;

  const cartItem = cart.find((item) => item.id === productId);
  if (!cartItem) {
    return res.status(404).json({ message: 'Item not in cart' });
  }

  cartItem.quantity = Math.max(1, cartItem.quantity + amount);
  res.json(cart);
});

// Route to get current cart
app.get('/api/cart', (req, res) => {
  res.json(cart);
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
