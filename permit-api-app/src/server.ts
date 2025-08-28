import express from "express";
import { createServer } from "http";
import { AddressInfo } from "net";
import PermitDao from "./permit-entity";
import { NewPermitSchema } from "./permit-validator";

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  console.log("Request hit backend");
  next();
});

// Middleware to parse JSON request bodies
app.use(express.json());


app.get('/health-check', (req, res) => {
  res.send('Hello World!')
})

// getAll
app.get("/permits", (req, res) => {
  res.json({ message: "Express server running" });
});

// Route with parameters
app.get("/permits/:id", (req, res) => {
  console.log("getting permit by id.");
  const body = req.body();
  console.log(body);
  // res.json({ userId, name: "John Doe" });
});

// POST route
app.post("/permits", (req, res) => {
  try {
    console.log("creating permit");
    console.log(`body = ${JSON.stringify(req.body)}`);
    const validatedPermit = NewPermitSchema.parse(req.body);
    PermitDao.create(validatedPermit).then(resp => {
      console.log(`Persisted Permit=${resp}`);
      res.status(201).json(validatedPermit);
    });

  } catch (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error
    });
  }
});
// Check if port is already in use before starting
const server = createServer(app);

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

server.on('listening', () => {
  const addr = server.address() as AddressInfo;
  console.log(`✅ Server running on http://localhost:${addr.port}`);
});

// Start the server
server.listen(PORT);
