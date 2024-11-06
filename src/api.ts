import bcrypt from "bcrypt";
import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import db from "./db";
import { LoginBody, User } from "./models/user.model";
const saltRounds = 10;
const JWT_SECRET = "this_is_a_secret";
const router = Router();

const products = [
  {
    id: 1,
    name: "Decorative Vase",
    description: "Beautiful ceramic vase with floral patterns.",
  },
  {
    id: 2,
    name: "Wall Art",
    description: "Modern abstract wall art to enhance your living space.",
  },
  {
    id: 3,
    name: "Indoor Plant Pot",
    description: "Eco-friendly plant pot for indoor use.",
  },
  {
    id: 4,
    name: "Cushion Set",
    description: "Soft and comfy cushion set for your sofa.",
  },
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

        // Send a success response with the user's ID
        res.status(201).json({
          message: "User registered successfully",
          userId: this.lastID,
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
            expiresIn: "1h", // Token will expire in 1 hour
          }
        );

        // If login is successful
        res.status(200).json({ message: "Login successful", token });
      }
    );
  }
);

router.get("/products", (req: Request, res: Response) => {
  res.json(products);
});

module.exports = router;
