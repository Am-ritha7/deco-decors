import fs from "fs";
import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./deco_decors.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");

    // Create tables in sequence to ensure proper timing
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
          dropProductsOnInit();
          createProductsTable();
          createFeedbackTable();
          createOrdersTable();
          createCartTable();
        }
      }
    );
  }
});

function dropProductsOnInit() {
  // Drop the products table if it exists
  db.run("DROP TABLE IF EXISTS products", (err) => {
    if (err) {
      console.error("Error dropping products table:", err.message);
    } else {
      console.log("Products table dropped successfully.");
    }
  });
}

function createProductsTable() {
  db.run(
    `CREATE TABLE IF NOT EXISTS products (
      prod_id INTEGER PRIMARY KEY AUTOINCREMENT,
      prod_name TEXT NOT NULL,
      price REAL NOT NULL,
      image_url TEXT,
      offer TEXT,
      description TEXT
    )`,
    (err) => {
      if (err) {
        console.error("Error creating products table:", err.message);
      } else {
        console.log("Products table created or already exists.");
        insertProductsFromJSON(); // Proceed to insert data
      }
    }
  );
}

function createFeedbackTable() {
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

function createOrdersTable() {
  db.run(
    `CREATE TABLE IF NOT EXISTS orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      prod_id INTEGER NOT NULL,
      payment_details TEXT,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (prod_id) REFERENCES products(prod_id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    (err) => {
      if (err) {
        console.error("Error creating orders table:", err.message);
      } else {
        console.log("Orders table created or already exists.");
      }
    }
  );
}

function createCartTable() {
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
}

function insertProductsFromJSON() {
  fs.readFile("./products.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err.message);
    } else {
      try {
        const products: Array<{
          prod_name: string;
          price: number;
          image_url: string;
          offer: string;
          description: string;
        }> = JSON.parse(data);

        products.forEach((product) => {
          db.run(
            `INSERT INTO products (prod_name, price, image_url, offer, description)
             VALUES (?, ?, ?, ?, ?)`,
            [
              product.prod_name,
              product.price,
              product.image_url,
              product.offer,
              product.description,
            ],
            (err) => {
              if (err) {
                console.error(
                  `Error inserting product "${product.prod_name}":`,
                  err.message
                );
              } else {
                console.log(
                  `Product "${product.prod_name}" inserted successfully.`
                );
              }
            }
          );
        });
      } catch (parseErr) {
        console.error("Error parsing JSON data:", (parseErr as Error).message);
      }
    }
  });
}

export default db;
