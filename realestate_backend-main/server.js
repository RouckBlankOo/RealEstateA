require("dotenv").config();
const path = require('path');
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const http = require("http");
const fs = require("fs");
const logger = require("./src/api/utils/logger");

const authRouter = require("./src/api/routes/authRouter");
const userRouter = require("./src/api/routes/userRouter");
const supportRouter = require("./src/api/routes/supportRouter");
const supportRouterNew = require("./src/api/routes/supportRouterNew");
const messageRouter = require("./src/api/routes/messageRouter");
const clientMessageRouter = require("./src/api/routes/clientMessageRouter");
const socketHandler = require("./src/api/utils/socketHandler");

const propertiesRouter = require("./src/api/routes/propertiesRouter");
const vehiclesRouter = require("./src/api/routes/vehiclesRouter");

const app = express();
const server = http.createServer(app);

// Connect to database
connectDB();

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, "images-users");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info(`Created upload directory at: ${uploadDir}`);
}

// CORS configuration
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Stripe-Signature"],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(
  bodyParser.json({
    parameterLimit: 100000,
    limit: "150mb",
    extended: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/images-users", express.static(path.join(__dirname, "images-users")));
// Serve property uploads
app.use("/uploads", express.static(path.join(__dirname, "src/api/uploads")));

// Routes
app.get("/", (req, res) => {
  res.send("REAL ESTATE SERVER RUNNING 🟢 STAY AWAY ⛔");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/support", supportRouter);
app.use("/api/support-v2", supportRouterNew); // New support system
app.use("/api/messages", messageRouter);
app.use("/api/properties", propertiesRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/client/messages", clientMessageRouter);

// Error handling
app.use((err, req, res, next) => {
  logger.error(`Global error handler: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(err.status || 500);
  res.send({
    success: false,
    message: err.message,
  });
});

// Process exceptions
process.on("uncaughtException", function (err) {
  logger.error("Uncaught exception:", err);
});

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  logger.info(`🟢 SERVER RUNNING ON ${port}`);

  // Initialize Socket.io for real-time messaging
  const io = socketHandler.initializeSocket(server);
  app.set('io', io); // Make io accessible to routes
  logger.info(`🔌 WebSocket initialized for real-time messaging`);
});