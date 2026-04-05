const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const db = require("./src/config/db");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [process.env.FRONTEND_URL],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const participantRoutes= require("./src/routes/participantRoutes")
const emailRoutes = require("./src/routes/emailRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const initTables = require("./src/config/initTables");

// Initialize Database Tables
initTables();

// Use routes
app.use("/auth", authRoutes);
app.use("/participants",participantRoutes)
app.use("/emails", emailRoutes);
app.use("/generation",emailRoutes)
app.use("/events", eventRoutes);
app.use("/admin", adminRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
