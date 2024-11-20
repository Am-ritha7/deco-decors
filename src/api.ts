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

router.get("/add-cart/:id", (req: any, res: any) => {
  const product_id = req.params.id;
  const token: string = req.headers["authorization"]?.split(" ")[1] ?? "";
  const user_id = decodeToken(token); // Assuming you have a function to decode the JWT token

  // Validate input
  if (!user_id || !product_id) {
    return res
      .status(400)
      .json({ error: "user_id and product_id are required" });
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

router.get("/cart", (req: any, res: any) => {
  const token: string = req.headers["authorization"]?.split(" ")[1] ?? "";
  const user_id = decodeToken(token); // Assuming you have a function to decode the JWT token

  // Validate if user_id is extracted
  if (!user_id) {
    return res.status(400).json({ error: "User not authenticated" });
  }

  const query = `SELECT * FROM cart WHERE user_id = ?`;

  db.all(query, [user_id], (err, rows) => {
    if (err) {
      console.error("Error retrieving cart items:", err.message);
      return res.status(500).json({ error: "Failed to retrieve cart items" });
    }

    res.json(rows); // Send back the list of cart items
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
