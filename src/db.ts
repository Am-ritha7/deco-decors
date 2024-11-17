import sqlite3 from "sqlite3";

// Initialize and configure SQLite database
const db = new sqlite3.Database("./deco_decors.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");

    // Create users table if it doesn't exist
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        name TEXT,
        phoneNo TEXT,
        gender TEXT,
        email TEXT UNIQUE,
        password TEXT
      )`,
      (err) => {
        if (err) {
          console.error("Error creating users table:", err.message);
        } else {
          console.log("Users table created or already exists.");
        }
      }
    );

    // Create products table if it doesn't exist
    db.run(
      `CREATE TABLE IF NOT EXISTS products (
        prod_id INTEGER PRIMARY KEY AUTOINCREMENT,
        prod_name TEXT NOT NULL,
        price REAL NOT NULL,
        image_url TEXT,
        user_id INTEGER,
        description TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      (err) => {
        if (err) {
          console.error("Error creating products table:", err.message);
        } else {
          console.log("Products table created or already exists.");
        }
      }
    );

Here's the updated code, complete with a sample insertion of products including images into the products table. It also includes serving images using Express for local hosting.

Updated Code
server.js
javascript
Copy code
import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "assets"))); // Serve static files

// Initialize and configure SQLite database
const db = new sqlite3.Database("./deco_decors.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");

    // Create users table
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        name TEXT,
        phoneNo TEXT,
        gender TEXT,
        email TEXT UNIQUE,
        password TEXT
      )`,
      (err) => {
        if (err) {
          console.error("Error creating users table:", err.message);
        } else {
          console.log("Users table created or already exists.");
        }
      }
    );

    // Create products table
    db.run(
      `CREATE TABLE IF NOT EXISTS products (
        prod_id INTEGER PRIMARY KEY AUTOINCREMENT,
        prod_name TEXT NOT NULL,
        price REAL NOT NULL,
        image_url TEXT,
        user_id INTEGER,
        description TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      (err) => {
        if (err) {
          console.error("Error creating products table:", err.message);
        } else {
          console.log("Products table created or already exists.");
        }
      }
    );
  }
});
db.run(
  `INSERT INTO products (prod_id,prod_name, price, image_url, user_id, description)
   VALUES (?, ?, ?, ?, ?)`,
  ["Sample Product", 19.99, "http://localhost:3000/assets/imghm8.jpg", 1, "This is a sample description"],
  (err) => {
    if (err) {
      console.error("Error inserting data into products table:", err.message);
    } else {
      console.log("Product inserted successfully.");
    }
  }
);




    // Create cart table if it doesn't exist
    db.run(
      `CREATE TABLE IF NOT EXISTS cart (
        cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(prod_id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      (err) => {
        if (err) {
          console.error("Error creating cart table:", err.message);
        } else {
          console.log("Cart table created or already exists.");
        }
      }
    );

    // Create orders table if it doesn't exist
    db.run(
      `CREATE TABLE IF NOT EXISTS orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        prod_id INTEGER NOT NULL,
        payment_details TEXT,
        FOREIGN KEY (prod_id) REFERENCES products(prod_id)
      )`,
      (err) => {
        if (err) {
          console.error("Error creating orders table:", err.message);
        } else {
          console.log("Orders table created or already exists.");
        }
      }
    );

    // Create feedback table if it doesn't exist
    db.run(
      `CREATE TABLE IF NOT EXISTS feedback (
        feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        prod_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comments TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (prod_id) REFERENCES products(prod_id)
      )`,
      (err) => {
        if (err) {
          console.error("Error creating feedback table:", err.message);
        } else {
          console.log("Feedback table created or already exists.");
        }
      }
    );
  }
});

export default db;

