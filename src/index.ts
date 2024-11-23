// src/index.ts
import bodyParser from "body-parser";
import dotenv from "dotenv";
import express, { Express, Router } from "express";
const api = require("./api");
const path = require("path");
const router = Router();

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.use(bodyParser.json());
router.use("/api", api);
app.use(router);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
