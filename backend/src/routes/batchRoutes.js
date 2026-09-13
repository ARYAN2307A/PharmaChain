const express = require("express");

const {
    createBatch,
    getBatches
} = require("../controllers/batchController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createBatch);
router.get("/", protect, getBatches);

module.exports = router;