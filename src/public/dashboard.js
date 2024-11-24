import express from "express";
import path from "path";
import adminRoutes from "./routes/admin.js";
import express from "express";

const router = express.Router();

// Orders
router.get("/orders", (req, res) => {
  res.send("<h1>Orders Page</h1><p>List of orders goes here...</p>");
});

// Payments
router.get("/payments", (req, res) => {
  res.send("<h1>Payment History</h1><p>List of payment details...</p>");
});

// Users
router.get("/users", (req, res) => {
  res.send("<h1>Users</h1><p>List of users goes here...</p>");
});

// Feedback
router.get("/feedbacks", (req, res) => {
  res.send("<h1>Feedback</h1><p>Feedback responses go here...</p>");
});

export default router;


const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse JSON
app.use(express.json());

// Admin routes
app.use("/admin", adminRoutes);

// Logout route
app.get("/logout", (req, res) => {
  res.sendFile(path.join(__dirname, "public/logout.html"));
});

// Default route
app.get("/", (req, res) => {
  res.redirect("/admin");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
