const express = require("express");
const cors = require("cors");
const medicineRoutes = require("./routes/medicineRoutes");
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");
const batchRoutes = require("./routes/batchRoutes");
const app = express();
const transferRoutes = require("./routes/transferRoutes");
// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/batches", batchRoutes);
app.use("/api/transfers", transferRoutes);
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
// Test route
app.get("/", protect, (req, res) => {
    res.json({
        message: "PharmaChain Backend is running!"
    });
});

module.exports = app;