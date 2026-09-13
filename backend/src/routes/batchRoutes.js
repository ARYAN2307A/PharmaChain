const express = require("express");

const {
    createBatch,
    getBatches,
    verifyBatch,
    recallBatch
} = require("../controllers/batchController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createBatch);
router.get("/", protect, getBatches);
router.get("/:id/verify", protect, verifyBatch);
router.put("/:id/recall", protect, recallBatch);
module.exports = router;