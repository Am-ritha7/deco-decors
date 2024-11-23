import bcrypt from "bcrypt";
import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import db from "./db";
import { LoginBody, User } from "./models/user.model";
const saltRounds = 10;
const JWT_SECRET = "this_is_a_secret";
const router = Router();

router.post(
  "/register",
  async (req: Request<{}, {}, User>, res: Response, next: NextFunction) => {
    const { username, name, phoneNo, gender, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    try {
      // SQL query to insert a new user
      const query = `INSERT INTO users (username, name, phoneNo, gender, email, password) VALUES (?, ?, ?, ?, ?, ?)`;
      const params = [username, name, phoneNo, gender, email, hashedPassword];

      db.run(query, params, function (err: Error | null) {
        if (err) {
          console.error("Error inserting data:", err.message);

          if (err.message.includes("UNIQUE constraint failed")) {
            return res
              .status(400)
              .json({ error: "Username or email already exists" });
          }

          return next(err);
        }

        const token = jwt.sign(
          { id: this.lastID, username: username },
          JWT_SECRET,
          {
            expiresIn: "1h", // Token will expire in 1 hour
          }
        );
        // Send a success response with the user's ID
        res.status(201).json({
          message: "User registered successfully",
          userId: this.lastID,
          token,
        });
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/login",
  (req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    db.get(
      `SELECT * FROM users WHERE email = ?`,
      [email],
      async (err, user: User | undefined) => {
        if (err) {
          console.error("Error retrieving user:", err.message);
          return next(err);
        }

        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
        // Generate JWT token
        const token = jwt.sign(
          { id: user.email, username: user.username },
          JWT_SECRET,
          {
            expiresIn: "60 days", // Token will expire in 1 hour
          }
        );
        // If login is successful
        res.status(200).json({ message: "Login successful", token });
      }
    );
  }
);

router.get("/products", (req: Request, res: Response) => {
  const query = `SELECT * FROM products`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching products:", err.message);
      res.status(500).json({ error: "Failed to fetch products" });
    } else {
      res.status(200).json(rows);
    }
  });
});

router.get("/add-cart/:id", (req: Request, res: Response) => {
  const product_id = req.params.id;
  const token: string = req.headers["authorization"]?.split(" ")[1] ?? "";
  const user_id = decodeToken(token); // Assuming you have a function to decode the JWT token

  // Validate input
  if (!user_id || !product_id) {
    res.status(400).json({ error: "user_id and product_id are required" });
    return;
  }

  const insertQuery = `INSERT INTO cart (user_id, product_id, date) VALUES (?, ?, date('now'))`;

  db.run(insertQuery, [user_id, product_id], (err) => {
    if (err) {
      console.error("Error adding item to cart:", err.message);
      return res.status(500).json({ error: "Failed to add item to cart" });
    }

    // Retrieve all cart items for this user after successful insertion
    const selectQuery = `SELECT * FROM cart WHERE user_id = ?`;

    db.all(selectQuery, [user_id], (err, rows) => {
      if (err) {
        console.error("Error retrieving cart items:", err.message);
        return res.status(500).json({ error: "Failed to retrieve cart items" });
      }

      res.json(rows); // Send back the list of cart items
    });
  });
});

router.delete("/remove-cart/:id", (req: Request, res: Response) => {
  const product_id = req.params.id;
  const token: string = req.headers["authorization"]?.split(" ")[1] ?? "";
  const user_id = decodeToken(token); // Assuming you have a function to decode the JWT token

  // Validate input
  if (!user_id || !product_id) {
    res.status(400).json({ error: "user_id and product_id are required" });
    return;
  }

  const deleteQuery = ` DELETE FROM cart
  WHERE ROWID = (
    SELECT ROWID
    FROM cart
    WHERE user_id = ? AND product_id = ?
    LIMIT 1
  )`;

  db.run(deleteQuery, [user_id, product_id], (err) => {
    if (err) {
      console.error("Error removing item from cart:", err.message);
      return res.status(500).json({ error: "Failed to remove item from cart" });
    }

    // Retrieve updated cart items for this user after deletion
    const selectQuery = `SELECT * FROM cart WHERE user_id = ?`;

    db.all(selectQuery, [user_id], (err, rows) => {
      if (err) {
        console.error("Error retrieving updated cart items:", err.message);
        return res.status(500).json({ error: "Failed to retrieve cart items" });
      }

      res.json(rows); // Send back the updated list of cart items
    });
  });
});

router.get("/cart", (req: Request, res: Response) => {
  const token: string = req.headers["authorization"]?.split(" ")[1] ?? "";
  const user_id = decodeToken(token); // Assuming you have a function to decode the JWT token

  // Validate if user_id is extracted
  if (!user_id) {
    res.status(400).json({ error: "User not authenticated" });
    return;
  }

  // SQL Query to join cart and products tables
  const query = `
 SELECT
   cart.cart_id,
   cart.user_id,
   cart.product_id,
   cart.date,
   products.prod_name AS name,
   products.image_url,
   products.price,
   products.description,
   COUNT(cart.product_id) AS quantity
 FROM
   cart
 INNER JOIN
   products ON cart.product_id = products.prod_id
 WHERE
   cart.user_id = ?
 GROUP BY
   cart.product_id;
`;

  db.all(query, [user_id], (err, rows) => {
    if (err) {
      console.error("Error fetching cart items:", err.message);
      return res.status(500).json({ error: "Failed to fetch cart items" });
    }

    // Send the combined cart item details as JSON response
    res.json(rows);
  });
});

router.get("/user-info", (req: Request, res: Response, next: NextFunction) => {
  const token: string = req.headers["authorization"]?.split(" ")[1] ?? "";
  const user_id = decodeToken(token);

  if (!user_id) {
    res.status(401).json({ error: "Invalid User" });
    return;
  }

  db.get(
    `SELECT id, username, name, phoneNo, gender, email FROM users WHERE email = ?`,
    [user_id],
    async (err, user: User | undefined) => {
      if (err) {
        console.error("Error retrieving user:", err.message);
        res.status(401).send({ error: "Invalid credentials" });
      }

      if (!user) {
        res.status(401).send({ error: "Invalid credentials" });
        return;
      }
      res.status(200).send(user);
      return;
    }
  );
});

router.post("/order", (req: Request, res: Response) => {
  const token: string = req.headers["authorization"]?.split(" ")[1] ?? "";
  const user_id = decodeToken(token);
  if (!user_id) {
    res.status(400).json({ error: "User not authenticated" });
    return;
  }

  // SQL Query to join cart and products tables
  const query = `
 SELECT
   cart.cart_id,
   cart.user_id,
   cart.product_id,
   cart.date,
   products.prod_name AS name,
   products.image_url,
   products.price,
   products.description,
   COUNT(cart.product_id) AS quantity
 FROM
   cart
 INNER JOIN
   products ON cart.product_id = products.prod_id
 WHERE
   cart.user_id = ?
 GROUP BY
   cart.product_id;
`;

  db.all(query, [user_id], (err, cartItems) => {
    if (err) {
      console.error("Error fetching cart items:", err.message);
      return res.status(500).json({ error: "Failed to fetch cart items" });
    }

    const order_id = crypto.randomUUID();
    const placeholders = cartItems.map(() => "(?, ?, ?, ?)").join(", ");
    const query = `
  INSERT INTO orders (order_id, prod_id, user_id, quantity)
  VALUES ${placeholders}
`;

    // Flatten the array for the query values
    const values = cartItems.flatMap((item: any) => [
      order_id, // Use the same order_id for all entries in the batch
      item.product_id,
      user_id,
      item.quantity,
    ]);

    // Perform the batch insert
    db.run(query, values, function (err) {
      if (err) {
        console.error("Error performing batch insert:", err.message);
      } else {
        res.send({ order_id });
      }
    });
  });
});

router.post("/payment/:order_id", (req: Request, res: Response) => {
  const token: string = req.headers["authorization"]?.split(" ")[1] ?? "";
  const user_id = decodeToken(token); // Assuming you have a function to decode the JWT token

  // Validate if user_id is extracted
  if (!user_id) {
    res.status(400).json({ error: "User not authenticated" });
  }

  // Extract order_id from the route parameters
  const { order_id } = req.params;

  // Extract payment details from the request body
  const { paymentMethod } = req.body;
  console.log(paymentMethod, req.body);
  if (!paymentMethod) {
    res.status(400).json({ error: "Payment method is required" });
    return;
  }

  const payment_confirmed_at = new Date().toISOString(); // Timestamp for when the payment was confirmed

  const insertQuery = `
    INSERT INTO payments (order_id, user_id, payment_method, payment_confirmed_at)
    VALUES (?, ?, ?, ?)
  `;

  // Insert payment record into the database
  db.run(
    insertQuery,
    [order_id, user_id, paymentMethod, payment_confirmed_at],
    function (err) {
      if (err) {
        console.error("Error inserting payment:", err.message);
        return res.status(500).json({ error: "Failed to process payment" });
      }

      // Return success message with inserted payment ID
      res.status(200).json({
        message: "Payment processed successfully",
        payment_id: this.lastID, // Get the ID of the newly inserted record
      });
    }
  );
});

router.get("/order/:order_id", (req: Request, res: Response) => {
  const token: string = req.headers["authorization"]?.split(" ")[1] ?? "";
  const user_id = decodeToken(token); // Assuming you have a function to decode the JWT token

  // Validate if user_id is extracted
  if (!user_id) {
    res.status(400).json({ error: "User not authenticated" });
  }

  const { order_id } = req.params; // Get order_id from URL params

  // Query to join orders and products tables and aggregate total price
  const query = `
    SELECT
      o.order_id,
      p.prod_id AS product_id,
      p.prod_name AS product_name,
      o.quantity,
      p.price,
      (o.quantity * p.price) AS total_price
    FROM orders o
    JOIN products p ON o.prod_id = p.prod_id
    WHERE o.order_id = ? AND o.user_id = ?
  `;

  db.all(query, [order_id, user_id], (err, rows) => {
    if (err) {
      console.error("Error retrieving order details:", err.message);
      res.status(500).json({ error: "Failed to retrieve order details" });
      return;
    }

    if (rows.length === 0) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Calculate the total amount for the order
    const items = rows.map((row: any) => ({
      product_id: row.product_id,
      product_name: row.product_name,
      quantity: row.quantity,
      price: row.price,
    }));

    // Calculate the total amount by summing the total_price for all items
    const total = rows.reduce(
      (sum: number, row: any) => sum + row.total_price,
      0
    );

    // Send response back to the user
    res.json({
      order_id,
      items,
      total: total.toFixed(2), // Round to two decimal places for currency
    });
  });
});

function decodeToken(token: string) {
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // If the token is valid, return the decoded data (payload)
    console.log("Decoded token:", decoded);

    // Assuming 'id' is the user's email in the payload
    return decoded.id; // Return the 'id' (which is the user's email in this case)
  } catch (err: any) {
    console.error("Error verifying token:", err.message);
    return null; // Return null if the token is invalid or expired
  }
}

module.exports = router;
