const express = require("express");
const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  console.log("Request hit backend");
  next();
});

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Express server running" });
});

// Route with parameters
app.get("/permits/:id", (req, res) => {
  console.log("getting permit by id.");
  res.json({ userId, name: "John Doe" });
});

// POST route
app.post("/permits/id", (req, res) => {
  console.log("creating permit");
});

//at the bottom because middleware has to be defined first
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
