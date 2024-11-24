import bcrypt from "bcrypt";
import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import db from "./db";
import { LoginBody, User } from "./models/user.model";
const saltRounds = 10;
const JWT_SECRET = "this_is_a_secret";
const router = Router();

const statusOptions = [
  "Delivered",
  "Shipped",
  "Processing",
  "Payment Rejected",
  "Payment Processed",
];

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

      clearCart(user_id);
      updateOrderStatus(order_id, user_id, "Payment Processed");
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

router.get("/order-status", (req: Request, res: Response) => {
  // Get token from Authorization header
  const token: string = req.headers["authorization"]?.split(" ")[1] ?? "";

  // Decode token and extract user_id
  const user_id = decodeToken(token); // Assuming decodeToken returns user_id from token

  // Check if user_id is valid
  if (!user_id) {
    res.status(400).json({ error: "User not authenticated" });
    return;
  }

  // Query to fetch orders, status, and payment details
  const query = `
    SELECT
      o.order_id,
      os.status,
      p.payment_confirmed_at AS date,
      pr.prod_name,
      o.quantity
    FROM
      orders o
    JOIN
      products pr ON o.prod_id = pr.prod_id
    JOIN
      order_status os ON o.order_id = os.order_id
    JOIN
      payments p ON o.order_id = p.order_id
    WHERE
      o.user_id = ?
  `;

  // Execute query with the decoded user_id
  db.all(query, [user_id], (err, rows) => {
    if (err) {
      console.error("Error fetching order status:", err.message);
      return res.status(500).json({ error: "Failed to fetch order status" });
    }

    if (!rows.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    // Group products by order_id
    const orders = rows.reduce((acc: any[], row: any) => {
      let order = acc.find((o) => o.id === row.order_id);

      if (!order) {
        // Create a new order entry if not found
        order = {
          id: row.order_id,
          status: row.status,
          date: row.date, // Payment confirmed date
          products: [],
        };
        acc.push(order);
      }

      // Add product to the order
      order.products.push({
        name: row.prod_name,
        quantity: row.quantity,
      });

      return acc;
    }, []);

    // Return the grouped orders with product details
    return res.json(orders);
  });
});

// Assuming you're using Express and SQLite (or similar DB)
router.post("/submit-feedback", async (req: Request, res: Response) => {
  const { order_id, rating, comments } = req.body;
  const token: string = req.headers["authorization"]?.split(" ")[1] ?? "";
  const user_id = decodeToken(token); // Assuming you have a function to decode the JWT token

  // Validate if user_id is extracted
  if (!user_id) {
    res.status(400).json({ error: "User not authenticated" });
  }

  // Validate the incoming data
  if (!user_id || !order_id || !rating || !comments) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const query = `
      INSERT INTO feedback (user_id, order_id, rating, comments)
      VALUES (?, ?, ?, ?)
    `;
    const params = [user_id, order_id, rating, comments];

    await db.run(query, params); // Assuming you're using SQLite
    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/admin/order-status", (req: Request, res: Response) => {
  const query = `
    SELECT
      os.order_id AS id,
      os.status,
      DATE(os.last_update_on) AS date,
      os.user_id,
      u.username AS user_name,
      p.prod_name AS product_name,
      o.quantity AS product_quantity
    FROM
      order_status os
    JOIN
      users u ON os.user_id = u.id
    JOIN
      orders o ON os.order_id = o.order_id
    JOIN
      products p ON o.prod_id = p.prod_id
    ORDER BY
      os.order_id, p.prod_name;
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching order statuses:", err.message);
      return res.status(500).json({ error: "Failed to fetch order statuses" });
    }

    // Group the rows by order_id
    const groupedOrders: any[] = [];

    rows.forEach((row: any) => {
      let order = groupedOrders.find((order) => order.id === row.id);

      if (!order) {
        order = {
          id: row.id,
          status: row.status,
          date: row.date,
          user_id: row.user_id,
          user_name: row.user_name,
          products: [],
        };
        groupedOrders.push(order);
      }

      // Add the product to the order's product list
      order.products.push({
        name: row.product_name,
        quantity: row.product_quantity,
      });
    });

    // Return the grouped order status
    return res.json(groupedOrders);
  });
});

router.patch("/admin/order-status/:orderId", (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;

  // Validate status
  if (!statusOptions.includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  // Update the order status in the database
  db.run(
    "UPDATE order_status SET status = ? WHERE order_id = ?",
    [status, orderId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to update order status" });
      }

      res.json({ message: "Order status updated successfully" });
    }
  );
});

// Endpoint to get all payments for admin
router.get("/admin/payments", async (req: Request, res: Response) => {
  try {
    // SQL query to fetch payment information, joining payments, users, and orders tables
    const query = `
      SELECT p.payment_id, p.order_id, p.user_id, p.payment_method, p.payment_confirmed_at, u.username
      FROM payments p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.payment_confirmed_at DESC;
    `;

    db.all(query, [], (err, rows) => {
      // Return the grouped order status
      return res.json(rows);
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching payment history." });
  }
});

router.get("/admin/users", async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT id, username, name, phoneNo, gender, email FROM users
    `;

    db.all(query, [], (err, rows) => {
      // Return the grouped order status
      console.log(rows);
      return res.json(rows);
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Assuming you're using Express and SQLite (or a similar database)
router.get("/admin/feedbacks", async (Request, res: Response) => {
  try {
    // Query to fetch feedbacks with associated user details (assuming user table has username)
    const query = `
    SELECT
      feedback.feedback_id,
      feedback.order_id,
      feedback.rating,
      feedback.comments,
      users.username
    FROM feedback
    JOIN users ON feedback.user_id = users.id
  `;
    db.all(query, [], (err, rows) => {
      // Return the grouped order status
      console.log(rows);
      return res.json(rows);
    });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
function decodeToken(token: string) {
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    // Assuming 'id' is the user's email in the payload
    return decoded.id; // Return the 'id' (which is the user's email in this case)
  } catch (err: any) {
    console.error("Error verifying token:", err.message);
    return null; // Return null if the token is invalid or expired
  }
}

function clearCart(userId: string) {
  const query = `DELETE FROM cart WHERE user_id = ?`;
  db.run(query, [userId], function (err) {
    if (err) {
      console.error("Error deleting cart items:", err.message);
    } else {
      console.log(
        `Successfully deleted ${this.changes} rows for user_id: ${userId}`
      );
    }
  });
}

function updateOrderStatus(orderId: string, userId: string, status: string) {
  const query = `
    INSERT INTO order_status (order_id, status, user_id)
    VALUES (?, ?, ?);
  `;

  const params = [orderId, status, userId];

  // Assuming you have a database connection object `db`
  db.run(query, params, function (err) {
    if (err) {
      console.error("Error updating order status:", err.message);
      return { error: "Failed to update order status" };
    }
    console.log(`Order status updated successfully for order_id ${orderId}`);
    return { message: "Order status updated successfully", orderId };
  });
}

module.exports = router;
