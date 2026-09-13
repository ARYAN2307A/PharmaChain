const express = require("express");

const {
    createBatch,
    getBatches,
    verifyBatch,
    recallBatch,
    restoreBatch,
    getBatchQR
} = require("../controllers/batchController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:id/qr", protect, getBatchQR);
router.post("/", protect, createBatch);
router.get("/", protect, getBatches);
router.get("/:id/verify", verifyBatch);
router.put("/:id/recall", protect, recallBatch);
router.put("/:id/restore", protect, restoreBatch);
module.exports = router;